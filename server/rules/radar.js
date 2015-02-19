var _ = require('lodash');
var tools = require('rules/tools');

function events(actions, world, rules) {
    return _.flatten(tools.filterPlayersByEventType(actions, "radar").map(_.partial(_handleRadar, world.players, rules.radarRadius)));
}

function _handleRadar(tanks, radius, action) {
    return _.filter(tanks, _.partial(_isInside, action, radius)).reduce(function(memo, tank) {
        if (tank.team !== player.team) {
            memo.push({
                source: player,
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
        event: "radar",
        data: {
            id: event.target.id
        }
    });
}

module.exports = {
    events: events,
    messages: messages
}