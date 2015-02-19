var _ = require('lodash');
var tools = require('rules/tools');

function events(actions, world, rules, counter) {
    if (counter === 0) {
        return [{
            teams: '',
            opponents: '',
            rules: rules
        }]
    }
    return [];
}

function messages(events) {
    return [];
    /*
    return events.reduce(function(memo, event) {
        return memo.concat(getDetectedMessage(event)).concat(getRadarMessage(event));
    }, []); */
}

function startMessage(events) {
    var message = {
    };
    /* message.team = _.reduce(players, function(memo, other) {
        if (other.id !== player.id && other.team === player.team) {
            memo.push(_playerInfoWithPosition(other));
        }
        return memo;
    }, []);
    message.opponents = _.reduce(players, function(memo, other) {
        if (other.id !== player.id && other.team !== player.team && other.active) {
            memo.push(_playerInfo(other));
        }
        return memo;
    }, []); */
    return message;
}

module.exports = {
    events: events,
    messages: messages
}