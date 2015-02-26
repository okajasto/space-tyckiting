define([
    'jquery',
    'socket-io',
    'promise',
    'messageBox',
    'grid',
    'ui',
    './bots/_current/ai'],
    function($,
             io,
             Promise,
             MessageBox,
             Grid,
             Ui,
             Ai) {

    var BOT_COUNT = 3;
    var TARGET_URL = 'ws://localhost:3000';

    var ai = new Ai();

    start(ai, BOT_COUNT);

    function start(ai, botCount) {

        var $mapArea = $('#mapArea');
        var $map = $('<div class="map innerBorder"></div>');
        $mapArea.append($map);
        var messageBox = new MessageBox();
        var ui = new Ui();

        var grid = null;

        var bots = [];
        var opponents = [];
        var botIdMap = {};

        var playerId = null;

        var actions = [];

        var socket = new WebSocket(TARGET_URL);

        socket.onopen = function() {

            var config;
            var botTeam = ai.teamName;

            socket.onmessage = function (rawContent) {

                var content = JSON.parse(rawContent.data);

                console.log("CONTENTS", rawContent);

                if (content.type === "connected") {
                    var joinMessage = content.data;

                    config = joinMessage.config;

                    playerId = joinMessage.id;
                    console.log("JoinMessage", joinMessage);

                    grid = grid || new Grid($map, botTeam, config.width, config.height, config.cannon, config.radar);

                    socket.send(JSON.stringify({type:"join", data: {
                        name: botTeam
                    }}));

                } else if (content.type === "start") {
                    // It set three times, but it really doesn't matter
                    var opponents = content.data.opponents;
                    var you = content.data.you;

                    var data = content.data;

                    function action(id, type, x, y) {
                        var action = {
                            id: id,
                            type: type,
                            x: x,
                            y: y
                        };
                        botIdMap[id].lastAction = action;
                        actions.push(action);
                    }

                    function move(id) {
                        return function(x, y) {
                            return action(id, "move", x, y);
                        }

                    }

                    function radar(id) {
                        return function(x,y) {
                            grid.drawRadar(x,y);
                            return action(id, "radar", x, y);
                        }
                    }

                    function cannon(id) {
                        return function(x,y) {
                            grid.drawBlast(x,y);
                            return action(id, "cannon", x, y);
                        }
                    }

                    function message(message) {
                        // socket.send(JSON.stringify({type:"message", data: message}));
                    }

                    you.bots.forEach(function(bot, index) {
                        bots[index] = {
                            id: bot.id,
                            name: bot.name,
                            x: bot.x,
                            y: bot.y,
                            hp: config.starthHp,
                            last: {},
                            dead: false,
                            move: move(bot.id),
                            radar: radar(bot.id),
                            cannon: cannon(bot.id),
                            message: message
                        }

                        botIdMap[bot.id] = bots[index];
                    });

                    clearNotifications();
                    clearMessages();
                    grid.clear();
                    ui.reset();
                    bots[botIndex].bot_class = ui.getBotClass(botIndex);
                    grid.updatePosition(botId, data.you.x, data.you.y, bots[botIndex].bot_class, false);

                } else if (content.type === "events") {

                    var events = content.data.map(function(data) {
                        if (data.data.player === playerId) {
                            data.data.team = botTeam;
                        }
                        return data;
                    });

                    // First event is always the currentRound event
                    var currentRound = events[0].data.roundId;

                    if (currentRound === 0) {
                        bots.forEach(function(bot, index) {
                            ui.addBot(index, {id: bot.id, name: bot.name, hp: config.startHp, max: config.startHp}, config);
                        })
                    }

                    grid.clear();

                    // TODO Change team -> state. Additionally(or optionally) Include opponents, and bot info
                    _.where(events, { event:'team' }).forEach(function(team) {
                        team.data.forEach(function(bot) {
                            botIdMap[bot.id].hp = bot.hp;
                            if (botIdMap[bot.id].hp <= 0) {
                                botIdMap[bot.id].dead = true;
                            }
                            botIdMap[bot.id].x = bot.x;
                            botIdMap[bot.id].y = bot.y;
                            grid.updatePosition(bot.id, bot.x, bot.y, botIdMap[bot.id].bot_class, botIdMap[bot.id].dead);
                            ui.updateBot(bot);
                        })
                    });

                    _.where(events, {event:'die'}).forEach(function(death) {
                        grid.drawDestroyed(death.data.x, death.data.y)
                        if (death.data.player !== botTeam) {
                            var opponent = _.findWhere(opponents, {id: death.data.id});
                            if (!_.isUndefined(opponent)) {
                                opponent.dead = true;
                            };
                        }
                    });

                    ai.makeDecisions(currentRound, events, bots, config, opponents);

                    // console.log("Sending", JSON.stringify(actions));

                    socket.send(JSON.stringify({type:"actions", data: actions}));

                    actions = [];
                    // Only one set of events should be passed to the MasterMind

                    // We draw the situation after movements so that we wouldn't cause too much extra delay with an answer
                    events.forEach(function(event) {
                        if (event.event === "hit") {
                            if (event.data.player === botTeam) {
                                grid.gotHit(event.data.id);
                            }
                        } else if (event.event === "see") {
                            event.data.positions.forEach(function(position) {
                                grid.detect(position.x, position.y);
                            });
                        } else if (event.event === "message") {
                            var friendlyMessage = event.data.source.player === playerId;
                            showMessage(event.data.source, event.data.messageId, event.data.message, friendlyMessage);
                        }
                    });
                } else if (content.type === "end") {
                    if (content.data[0].data.winner && content.data[0].data.winner.player === playerId) {
                        showNotification("YOU<br>WIN");
                    } else {
                        showNotification("YOU<br>LOSE");
                    }
                }
            };
        };

        function clearNotifications() {
            $map.find('.notification').remove();
        }

        function showNotification(message) {
            $map.find('.notification').remove();
            $map.append('<div class="notification">' + message + '</div>')
        }
    }

    function clearMessages() {
        messageBox.clear();
    }

    function showMessage(source, id, message, friend) {
        messageBox.addMessage(source, id, message, friend ? 'friend' : 'foe');
    }
});
