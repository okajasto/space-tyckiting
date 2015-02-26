var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules, counter) {
    return world;
}

function messages(events) {
    return events.teams.map(function(team) {
        return tools.createMessage(team, {
            event: "team",
            data: _.where(events.allPlayers, {team: team}).map(tools.playerInfoWithPositionAndHp)
        });
    });
}

module.exports = {
    events: events,
    messages: messages
}