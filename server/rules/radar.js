var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules) {
    return _.flatten(tools.filterPlayersByEventType(actions, "radar").map(_.partial(_handleRadar, world.players, rules.radar)));
}

function _handleRadar(tanks, radius, action) {
    return _.filter(tanks, _.partial(tools.isInside, action.action, radius)).reduce(function(memo, tank) {
        if (tank.team !== action.team) {
            memo.push({
                source: action,
                target: tank
            })
        }
        return memo;
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
}