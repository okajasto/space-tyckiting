define([
    'jquery',
    'promise',
    'messageBox',
    'grid',
    'ui'],
    function($,
             Promise,
             MessageBox,
             Grid,
             Ui) {

    var TARGET_URL = 'ws://localhost:3000';

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

        socket.onmessage = function (rawContent) {

            var content = JSON.parse(rawContent.data);

            if (content.type === "connected") {
                var joinMessage = content.data;

                config = joinMessage.config;

                grid = grid || new Grid($map, "", config.width, config.height, config.cannon, config.radar);

                socket.send(JSON.stringify({type:"spectate", data: {}}));

            } else if (content.type === "start") {
                clearNotifications();
                clearMessages();
                grid.clear();
                ui.reset();
            } else if (content.type === "round") {

                grid.clear();

                content.data.actions.forEach(function(action) {
                    if (action.type === "radar") {
                        grid.drawRadar(action.x, action.y);
                    } else if (action.type === "cannon") {
                        grid.drawBlast(action.x, action.y);
                    }
                });

                var count = 0;

                _.forEach(content.data.messages, function(playerEvents, key) {
                    var team = _.findWhere(playerEvents, {event: "team"});
                    if (team) {
                        console.log("TEAM", team);
                        team.data.forEach(function(bot) {
                            console.log("Bot", bot);
                            grid.updatePosition(bot.id, bot.x, bot.y, "bot" + key, bot.hp <= 0);
                            if (!ui.hasBot(bot.id)) {
                                ui.addBot(0, bot, config);
                            } else {
                                ui.updateBot(bot);
                            }
                        })
                    }
                });
            } else if (content.type === "end") {
              /*  if (content.data[0].data.winner && content.data[0].data.winner.player === playerId) {
                    showNotification("YOU<br>WIN");
                } else {
                    showNotification("YOU<br>LOSE");
                } */
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

    function clearMessages() {
        messageBox.clear();
    }

    function showMessage(source, id, message, friend) {
        messageBox.addMessage(source, id, message, friend ? 'friend' : 'foe');
    }
});