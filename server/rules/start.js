var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules, counter) {
    if (counter === 0) {
        return {
            players: world.players,
            bots: world.bots,
            rules: rules
        };
    }
    return null;
}

function messages(events) {
    if (events) {
        return events.players.map(function(player) {
            var playerBots = _.where(events.bots, {player: player});
            var opponents = _.without(events.bots, playerBots);

            return tools.createMessage(player, {
                team: playerBots.map(function(bot) {
                    return tools.botInfoWithPositionAndHp(bot);
                }),
                opponents: opponents.map(function(opponent) {
                    return tools.botInfo(opponent);
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