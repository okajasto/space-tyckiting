var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules) {
    return _.flatten(tools.filterActionsByType(actions, "radar").map(_.partial(_handleRadar, world.bots, rules.radar)));
}

function _handleRadar(bots, radius, action) {
    return _.filter(bots, _.partial(tools.isInside, action, radius)).reduce(function(memo, bot) {

        var source = _.findWhere(bots, {id: action.id});

        if (source && bot.player !== source.player) {
            memo.push({
                source: source,
                target: bot
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