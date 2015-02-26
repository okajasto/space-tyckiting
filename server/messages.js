var _ = require('lodash');
var tools = require('./rules/tools');

function startMessage(player, players, bots, config) {
    var message = {
        you: {
            name: player.name,
            id: player.id,
            bots: _.where(bots, {player: player.id}).map(tools.botInfoWithPositionAndHp)
        },
        config: config
    };

    message.opponents =
        _.filter(players, function(other) {
            return other !== player.id
        }).map(function(opponent) {
            return {
                name: opponent.name,
                id: opponent.id,
                bots: _.filter(bots, function(bot) {
                    return bot.player !== player.id
                }).map(tools.botInfo)
            }
        });

    return message;
}

function spectatorStartMessage(players, bots, config) {
    return {
        players: players.map(function(player) {
            return {
                name: player.name,
                id: player.id
            };
        }),
        bots: bots.map(tools.botInfoWithPositionAndHp),
        rules: config
    };
}

module.exports = {
    startMessage: startMessage,
    spectatorStartMessage: spectatorStartMessage
}