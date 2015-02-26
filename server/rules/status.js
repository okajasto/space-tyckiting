var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules, counter) {
    return world;
}

function messages(events) {
    return events.players.map(function(player) {
        var test = tools.createMessage(player.id, {
            event: "team",
            data: _.where(events.allBots, {player: player.id}).map(tools.botInfoWithPositionAndHp)
        });
        console.log("TEST", _.where(events.allBots, {player: player.id}));
        return test;
    });
}

module.exports = {
    events: events,
    messages: messages
}