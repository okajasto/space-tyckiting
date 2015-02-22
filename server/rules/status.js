var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules, counter) {
    return world;
}

function messages(events) {
    return events.players.map(function(player) {
        return tools.createMessage(player, {
            event: "team",
            data: _.where(events.allPlayers, {player: player}).map(tools.botInfoWithPositionAndHp)
        });
    });
}

module.exports = {
    events: events,
    messages: messages
}