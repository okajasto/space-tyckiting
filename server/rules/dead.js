var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules) {
    return _.filter(world.players, function(player) {
        return player.hp <= 0;
    });
}

function applyEvents(dead, world, rules) {
    var players = _.without(world.players, dead);
    world.players = players;
    return world;
}

function messages(events) {
    return events.map(function(event) {
        return tools.createMessage("all", {
            event: "die",
            data: tools.playerInfoWithPosition(event)
        });
    });
}

module.exports = {
    events: events,
    applyEvents: applyEvents,
    messages: messages
}