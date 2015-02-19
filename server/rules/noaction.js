var _ = require('lodash');
var tools = require('rules/tools');

function getNoActions(actions, world, rules) {
    var noActions = _.filter(world.players, function(player) {
        if (_.findWhere(actions, {id:  player.id})) {
            return true;
        } else {
            return false;
        }
    });
    return noActions;
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