var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules) {
    return _.reduce(world.players, function(total, source) {
        return total.concat(_.reduce(world.players, function(result, target) {
            if (tools.inDistance(source.pos, target.pos, rules.see)) {
                if (source.team !== target.team) {
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
    return tools.createMessage(event.target.team, {
        event: "detected",
        data: {
            id: event.target.id
        }
    });
}

function getRadarMessage(event) {
    return tools.createMessage(event.source.team, {
        event: "see",
        data: {
            source: event.target.id,
            positions: [tools.playerInfoWithPosition(event.target)]
        }
    });
}

module.exports = {
    events: events,
    messages: messages
};ß