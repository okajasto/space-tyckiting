var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules, counter) {
    if (counter === 0) {
        return {
            teams: world.teams,
            players: world.players,
            rules: rules
        };
    }
    return null;
}

function messages(events) {
    if (events) {
        return events.teams.map(function(team) {
            var teamPlayers = _.where(events.players, {team: team});
            var opponents = _.without(events.players, teamPlayers);

            return tools.createMessage(team, {
                team: teamPlayers.map(function(player) {
                    return tools.playerInfoWithPositionAndHp(player);
                }),
                opponents: opponents.map(function(opponent) {
                    return tools.playerInfo(opponent);
                })
            });
        });
    } else {
        return [];
    }
}

module.exports = {
    events: events,
    messages: messages
}