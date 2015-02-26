var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules) {
    return _.filter(world.bots, function(bot) {
        return bot.hp <= 0;
    });
}

function applyEvents(dead, world, rules) {
    var bots = _.without(world.bots, dead);
    world.bots = bots;
    return world;
}

function messages(events) {
    return events.map(function(event) {
        return tools.createMessage("all", {
            event: "die",
            data: tools.botInfoWithPosition(event)
        });
    });
}

module.exports = {
    events: events,
    applyEvents: applyEvents,
    messages: messages
}