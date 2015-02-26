define([
    'jquery',
    'promise',
    'messageBox',
    'svgGrid',
    'ui'],
    function($,
             Promise,
             MessageBox,
             SvgGrid,
             Ui) {

    var TARGET_URL = 'ws://localhost:3000';

    var messageBox = new MessageBox();

    var ui = new Ui();

    var grid = null;

    var socket = new WebSocket(TARGET_URL);

    socket.onopen = function() {

        var config;

        socket.onmessage = function (rawContent) {

            var content = JSON.parse(rawContent.data);

            if (content.type === "connected") {
                var joinMessage = content.data;

                config = joinMessage.config;

                grid = grid || new SvgGrid('svgGrid', config.width, config.height, config.cannon, config.radar);

                socket.send(JSON.stringify({type:"spectate", data: {}}));

            } else if (content.type === "start") {
                clearNotifications();
                clearMessages();
                grid.clearAll();
                ui.reset();
            } else if (content.type === "round") {

                grid.clear();

                var actions = content.data.actions.reduce(function(memo, action) {
                    memo[action.id] = action;
                    return memo;
                }, {});

                var isFirst = true;
                _.forEach(content.data.messages, function(playerEvents) {
                    var team = _.findWhere(playerEvents, {event: "team"});
                    if (team) {
                        team.data.forEach(function(bot) {
                            if (!grid.hasShip(bot.id)) {
                                grid.addShip(bot.id, bot.x, bot.y, isFirst);
                            }
                            if (bot.hp <= 0) {
                                grid.destroyShip(bot.id);
                            } else {
                                grid.moveShip(bot.id, bot.x, bot.y);
                            }

                            var action = actions[bot.id];

                            if (action) {
                                if (action.type === "radar") {
                                    grid.radar(bot.x, bot.y, action.x, action.y);
                                } else if (action.type === "cannon") {
                                    grid.blast(bot.x, bot.y, action.x, action.y);
                                }
                            }

                            if (!ui.hasBot(bot.id)) {
                                ui.addBot(bot, isFirst, config);
                            } else {
                                ui.updateBot(bot);
                            }
                        });
                        isFirst = false;
                    }
                });
            } else if (content.type === "end") {

            }
        };
    };

    function clearNotifications() {
    }

    function showNotification(message) {
    }

    function clearMessages() {
        messageBox.clear();
    }

    function showMessage(source, id, message, friend) {
        messageBox.addMessage(source, id, message, friend ? 'friend' : 'foe');
    }
});