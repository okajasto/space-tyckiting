var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules) {
    return _.filter(world.bots, function(bot) {
        return !_.findWhere(actions, {id: bot.id});
    });
}

function messages(events) {
    return events.map(function(event) {
        return tools.createMessage(event.team, {
            event: "noaction",
            data: tools.botInfo(event)
        })
    });
}

module.exports = {
    events: events,
    messages: messages
}