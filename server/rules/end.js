var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules, counter) {
    // On tie, count hp
    if (counter >= rules.maxCount || _.isEmpty(world.players)) {
        return {
            data: {
                winner: {
                    team: undefined
                }
            }
        }
    }
    if (_.unique(_.pluck(world.players, "team")).length === 1) {
        return {
            data: {
                winner: {
                    team: world.players[0].team
                }
            }
        }
    }
    return null;
}

function applyEvents(events, world) {
    if (events) {
        world.finished = true;
    }
    return world;
}

function messages(events) {
    if (events) {
        return tools.createMessage("all", {
            event: "end",
            data: events
        });
    } else {
        return null;
    }
}

module.exports = {
    events: events,
    applyEvents: applyEvents,
    messages: messages
}