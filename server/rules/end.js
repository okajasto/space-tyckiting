var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules, counter) {
    // On tie, count hp
    if (counter >= rules.maxCount || _.isEmpty(world.bots)) {
        return {
            data: {
                winner: {
                    team: undefined
                }
            }
        }
    }
    if (_.unique(_.pluck(world.bots, "player")).length === 1) {
        return {
            data: {
                winner: {
                    player: world.bots[0].player
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