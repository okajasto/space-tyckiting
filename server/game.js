var Rules = require('./rules.js');
var Messages = require('./messages.js');
var ActionLog = require('./actionlog.js');
var _ = require('lodash');
var loop = require('./gameloop.js');
var ws = require('ws');

function Game(config) {

    var allPlayers = [];
    var spectators = [];
    var allBots = [];
    var started = false;
    var finished = false;

    var idCounter = 0;
    var botIdCounter = 0;

    var rules = [
        require('./rules/round'),
//        require('./rules/start'),
        require('./rules/status'),
        require('./rules/noaction'),
        require('./rules/move'),
        require('./rules/cannon'),
        require('./rules/dead'),
        require('./rules/see'),
        require('./rules/radar'),
        require('./rules/end')
    ];

    function rand(val) {
        return Math.floor(Math.random() * val);
    }

    function startListening(ws) {

        ws.on('connection', function(socket){

            var id = idCounter++;
            var player = {id: id, socket: socket};

            allPlayers.push(player);

            socket.on("close", function() {
                // TODO implement proper onclose
            });

            socket.on("message", function(rawData) {
                var data = JSON.parse(rawData);
                var content = data.data;

                if (data.type === "actions") {
                    console.log("%s: ", player.name, content);
                    if (!finished) {
                        player.actions = content;
                    }
                } else if (data.type === "message") {

                } else if (data.type === "spectate") {
                    if (player.active) {
                        if (socket) {
                            socket.send(JSON.stringify({type: "error", data: "Already in play"}));
                        }
                    } else {
                        spectators.push(player);
                    }
                } else if (data.type === "join" ) {

                    if (started) {
                        if (socket) {
                            socket.send(JSON.stringify({type: "error", data: "Already started"}));
                        }
                        return;
                    }
                    // Clear inactive players and spectators (players without connection)
                    allPlayers = _.filter(allPlayers, function(player) {
                        return player.socket.readyState === player.socket.OPEN;
                    });

                    player.name = content.name;
                    player.bots = _.range(config.bots).map(function(index) {
                        var name;
                        if (content.bots && content.bots[index]) {
                            name = content.bots[index];
                        } else {
                            name = id + "_" + index;
                        }
                        return {
                            id: botIdCounter++,
                            name: name
                        }
                    });
                    player.active = true;

                    if (Rules.checkForStart(allPlayers)) {
                        start(_.where(allPlayers, {active: true}), config);
                    }
                }
            });
            socket.send(JSON.stringify({type: "connected", data: {id: id, config: config}}));
        });

        var sendToPlayer = function(player, eventType, data) {
            if (player.socket.readyState === player.socket.OPEN) {
                player.socket.send(JSON.stringify({type: eventType, data: data}));
            }
        };

        var start = function(players, config) {
            finished = false;
            // Initialize positions and data
            var bots = players.reduce(function(memo, player) {
                return memo.concat(player.bots.map(function(bot) {
                    return {
                        id: bot.id,
                        name: bot.name,
                        player: player.id,
                        hp: config.startHp,
                        pos: {x: rand(config.width), y: rand(config.height)}
                    }
                }));
            }, []);

            var startMessage = Messages.spectatorStartMessage(players, bots, config);
            spectators.forEach(function(spectator) {
                sendToPlayer(spectator, "start", startMessage);
            });

            players.forEach(function(player) {
                sendToPlayer(player, "start", Messages.startMessage(player, players, bots, config));
            });

            started = true;
            setTimeout(function () {
                gameLoop(players, bots, 0, [] /*, {teams: ActionLog.getStartData(teams, players), turns: [], messages: []} */);
            }, 200);
        };

        var gameLoop = function(players, bots, counter, statistics) {

            console.log("Round ", counter);

            var activeBots = _.filter(bots, function(bot) {
                return bot.hp > 0;
            });

            var actions = [];

            if (counter > 0) {
                // TODO Consider using Rx.js
                actions = players.reduce(function(memo, player) {
                    if (player.actions) {
                        player.actions.forEach(function(action) {
                            var bot = _.findWhere(activeBots, {id: action.id, player: player.id});
                            if (bot) {
                                // TODO <- clone this
                                var _action = action;
                                _action.x = parseInt(_action.x, 10);
                                _action.y = parseInt(_action.y, 10);
                                memo.push(_action);
                            }
                        });
                    }
                    return memo;
                }, []);
            }

            var world = {
                players: players,
                bots: activeBots,
                allBots: bots
            };

            var round = loop(counter, actions, world, rules, config);

            var messagesByTeam = round.messages.reduce(function(memo, message) {
                if (message) {
//                    console.log("Message: ", message.content.event, message.target);
                    var target = _.isUndefined(message.target) ? "none" : message.target;
                    if (memo[target]) {
                        memo[target].push(message.content);
                    } else {
                        memo[target] = [message.content];
                    }
                }
                return memo;
            }, {});

            if (spectators.length > 0) {
                var spectateMessage = {
                    messages: messagesByTeam,
                    actions: actions
                };
                spectators.forEach(function(spectator) {
                    sendToPlayer(spectator, "round", spectateMessage);
                });
            }

            players.forEach(function(player) {
                var messages = messagesByTeam[player.id] || [];
                if (messagesByTeam["all"]) {
                    messages = messages.concat(messagesByTeam["all"]);
                }
                messages.map(function(message) {
                    if (message) {
                        return message.content;
                    } else {
                        return "";
                    }
                });
                sendToPlayer(player, "events", messages);
            });

            if (!round.world.finished) {
                setTimeout(function () {
                    gameLoop(players, bots, counter+1, statistics);
                }, config.loopTime);
            } else {
                finished = true;
                started = false;

                players.forEach(function(player) {
                    sendToPlayer(player, "end", _.filter(round.messages, function(message) {
                        return message.content.event === "end";
                    }).map(function(m) {
                        return m.content.data;
                    }));
                });
            }
        };
    };

    return {
        startListening: startListening
    }
}

module.exports = Game;