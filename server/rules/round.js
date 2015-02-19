var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules, counter) {
    return counter;
}

function messages(events) {
    return tools.createMessage("all", {
        event: "round",
        data: {
            roundId: events
        }
    });
}

module.exports = {
    events: events,
    messages: messages
}