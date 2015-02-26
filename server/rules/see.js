var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules) {
    return _.reduce(world.bots, function(total, source) {
        return total.concat(_.reduce(world.bots, function(result, target) {
            if (tools.inDistance(source.pos, target.pos, rules.see)) {
                if (source.player !== target.player) {
                    result.push(
                        {
                            source: source,
                            target: target
                        });
                }
            }
            return result;
        }, []));
    }, []);
}

function messages(events) {
    return events.reduce(function(memo, event) {
        return memo.concat(getDetectedMessage(event)).concat(getRadarMessage(event));
    }, []);
}

function getDetectedMessage(event) {
    return tools.createMessage(event.target.player, {
        event: "detected",
        data: {
            id: event.target.id
        }
    });
}

function getRadarMessage(event) {
    return tools.createMessage(event.source.player, {
        event: "see",
        data: {
            source: event.target.id,
            positions: [tools.botInfoWithPosition(event.target)]
        }
    });
}

module.exports = {
    events: events,
    messages: messages
};