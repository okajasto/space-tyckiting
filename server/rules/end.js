var _ = require('lodash');
var tools = require('rules/tools');

function events(actions, world, rules, counter) {

    if (counter >= rules.maxCount || _.isEmpty(world.players)) {
        return {
            result: "tie"
        }
    }
    if (_.unique(_.pluck(world.players, "team")).length === 1) {
        return {
            result: "victory",
            team: world.players[0].team
        }
    }
    return [];
}

function apply(events, world, rules) {
    if (events.length > 0 ) {
        world.finished = true;
    }
    return world;
}

function messages(events) {
    return tools.createMessage("all", {
        event: "end",
        data: events[0]
    });
}

module.exports = {
    events: events,
    apply: apply,
    messages: messages
}