var Rules = require('./rules.js');
var Messages = require('./messages.js');
var ActionLog = require('./actionlog.js');
var _ = require('lodash');
var loop = require('./gameloop.js');
var ws = require('ws');

function Game(config) {

    var allPlayers = [];
    var started = false;
    var finished = false;

    var idCounter = 0;

    var rules = [
        require('./rules/round'),
        require('./rules/start'),
        require('./rules/status'),
        require('./rules/noaction'),
        require('./rules/move'),
        require('./rules/cannon'),
        require('./rules/dead'),
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

            socket.on("message", function(rawData) {
                var data = JSON.parse(rawData);
                var content = data.data;

                if (data.type === "action") {
                    console.log("%s: ", player.name, content);
                    if (!finished) {
                        player.action = content;
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

                    console.log("Received join", player.id,  player.socket.readyState);

                    player.name = content.name;
                    player.team = content.team;
                    player.active = true;

                    if (Rules.checkForStart(allPlayers, config.teamPlayers)) {
                        start(_.where(allPlayers, {active: true}), config);
                    }
                }
            });

        /*    socket.on("message", function(message) {
                player.message = message;
            }); */

        /*    socket.on('disconnect', function () {
                console.log("Disconnect", id);
                player.active = false;
            }); */

            socket.send(JSON.stringify({type: "connected", data: {id: id, config: config}}));
        });

        var sendToTeam = function(team, players, eventType, data) {
            var members = _.where(players, {team: team});
            members.forEach(function(member) {
                member.socket.send(JSON.stringify({type: eventType, data: data}));
            });
        };

        var start = function(players, config) {
            var teams = _.uniq(_.pluck(players,'team'));
            finished = false;
            // Initialize positions and data
            players.forEach(function(player) {
                player.hp = config.startHp;
                player.pos = {x: rand(config.width), y: rand(config.height)};
            });
            players.forEach(function(player) {
                if (player.socket && player.socket.readyState === player.socket.OPEN) {
                    player.socket.send(JSON.stringify({type: "start", data: Messages.startMessage(player, players, config)}));
                }
            });
            started = true;
            setTimeout(function () {
                gameLoop(teams, players, 0, {teams: ActionLog.getStartData(teams, players), turns: [], messages: []});
            }, 200);
        };

        var gameLoop = function(teams, players, counter, statistics) {

            console.log("Round ", counter);

            var activePlayers = _.filter(players, function(player) {
                return player.hp > 0 && player.active;
            });

            if (counter === 0) {
                // The round 0 is start round. No actions should be performed before it.
                activePlayers.forEach(function(player) {
                    player.action = null;
                });
            } else {
                activePlayers.forEach(function(player) {
                    if (player.action) {
                        player.action.x = parseInt(player.action.x, 10);
                        player.action.y = parseInt(player.action.y, 10);
                    }
                });
            }

            var world = {
                teams: teams,
                players: activePlayers,
                allPlayers: players
            };

            var round = loop(counter, activePlayers, world, rules, config);

            teams.forEach(function(team) {
                var messages = _.filter(round.messages, function(message) {
                    return (message && (message.target === team || message.target === "all"));
                }).map(function(message) {
                    return message.content;
                });
                sendToTeam(team, activePlayers, "events", messages);
            });

            players.forEach(function(player) {
                // Clear the previous events
                player.action = null;
                player.message = null;
            });

            if (!round.world.finished) {
                setTimeout(function () {
                    gameLoop(teams, players, counter+1, statistics);
                }, config.loopTime);
            } else {
                finished = true;
                started = false;

                teams.forEach(function(team) {
                    sendToTeam(team, players, "end", _.filter(round.messages, function(message) {
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