var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules) {
    return _.filter(world.players, function(player) {
        if (_.findWhere(actions, {id:  player.id})) {
            return false;
        } else {
            return true;
        }
    });
}

function messages(events) {
    return events.map(function(event) {
        return tools.createMessage(event.team, {
            event: "noaction",
            data: tools.playerInfo(event)
        })
    });
}

module.exports = {
    events: events,
    messages: messages
}