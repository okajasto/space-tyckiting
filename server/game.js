var Rules = require('./rules.js');
var Messages = require('./messages.js');
var ActionLog = require('./actionlog.js');
var _ = require('lodash');
var loop = require('./gameloop.js');
var ws = require('ws');

function Game(config) {

    var allPlayers = [];
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
            var bots = [{id: botIdCounter++, name: id + "_0"}, {id: botIdCounter++, name: id + "_1"}, {id: botIdCounter++, name: id + "_2"}];

            console.log("Bots", bots);

            var player = {id: id, socket: socket, bots: bots};

            allPlayers.push(player);

            socket.on("close", function(){

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

                } else if (data.type === "join" ) {
                    if (started) {
                        if (socket) {
                            socket.send(JSON.stringify({type: "error", data: "Already started"}));
                        }
                        return;
                    }
                    // Clear inactive players (players without connection)
                    allPlayers = _.filter(allPlayers, function(player) {
                        return player.socket.readyState === player.socket.OPEN;
                    });

                    console.log("Content", content);

                    player.name = content.name;
                    // TODO Get bot names
//                    player.bots = content.bots;
                    player.active = true;

                    if (Rules.checkForStart(allPlayers)) {
                        start(_.where(allPlayers, {active: true}), config);
                    }
                }
            });
            socket.send(JSON.stringify({type: "connected", data: {id: id, config: config, bots: bots}}));
        });

        var sendToPlayer = function(player, eventType, data) {
            player.socket.send(JSON.stringify({type: eventType, data: data}));
        };

        var start = function(players, config) {
            finished = false;
            // Initialize positions and data
            var bots = [];

            players.forEach(function(player) {
                for (var i = 0; i < 3; ++i) {
                    bots.push({
                        id: player.bots[i].id,
                        name: player.bots[i].name,
                        player: player.id,
                        hp: config.startHp,
                        pos: {x: rand(config.width), y: rand(config.height)}
                    });
                };
            });

            players.forEach(function(player) {
                if (player.socket && player.socket.readyState === player.socket.OPEN) {
                    console.log("Start Message to ", player.name);
                    sendToPlayer(player, "start", Messages.startMessage(player, players, bots, config));
                }
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
                // TODO change to map etc. or start using Rx.js
                players.forEach(function(player) {

                    console.log("PLAYER-ACTIONS: ", player.actions);

                    if (player.actions) {
                        player.actions.forEach(function(action) {
                            var bot = _.where(activeBots, {id: action.id, player: player.id});
                            if (bot) {
                                // TODO <- clone this
                                var _action = action;
                                _action.x = parseInt(_action.x, 10);
                                _action.y = parseInt(_action.y, 10);
                                actions.push(_action);
                            }
                        });
                    }
                });
            }

            console.log("ACTIONS", actions);

            var world = {
                players: players,
                bots: activeBots,
                allBots: bots
            };

            var round = loop(counter, actions, world, rules, config);

            players.forEach(function(player) {
                var messages = _.filter(round.messages, function(message) {
                    return (message && (message.target === player.id || message.target === "all"));
                }).map(function(message) {
                    return message.content;
                });

                console.log("SEND to %s %s", player.name, messages);
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