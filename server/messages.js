var _ = require('lodash');
var tools = require('./rules/tools');

var messageCount = 0;

function getRoundStartMessage(counter) {
    return {
        event: "round",
        data: {
            roundId: counter
        }
    }
}

function getNoActionMessagesByTeam(noActionBots, team) {
    return noActionBots.reduce(function(memo, bot) {
        if (bot.team === team) {
            return memo.concat({
                event: "noaction",
                data: _playerInfo(bot)
            });
        }
        return memo;
    }, []);
}

function getMessages(players) {
    return players.reduce(function(memo, player) {
        if (player.message) {
            memo.push({
                event: "message",
                data: {
                    messageId: messageCount++,
                    source: _playerInfo(player),
                    message: player.message
                }
            })
        }
        return memo;
    }, []);
}

function getMoveMessagesByPlayer(moves, player) {
    return _.where(moves, {"id": player.id}).map(function(move) {
        return {
            event: "move",
            data: move
        }
    });
}

function getDetectedMessagesByPlayer(radars, player) {
    if (_.where(radars, {"target": player}).length > 0) {
        return {
            event: "detected",
            data: {
                id: player.id
            }
        }
    } else {
        return [];
    }
}

function getRadarMessagesByPlayer(radars, player) {
    var detections = _.pluck(_.where(radars, {"source": player.id}), "target").map(_playerInfoWithPosition);

    return {
        event: "see",
        data: {
            source: player.id,
            "positions" : detections
        }
    }
}

function getCannonMessagesByPlayer(cannons, player) {
    var damages = _.pluck(_.where(cannons, {"source": player.id}), "target").map(function(target) {
        var message = _playerInfo(target);
        message.source = _playerInfo(player);

        return {
            event: "hit",
            data: message
        }
    });
    damages = damages.concat(_.where(cannons, {"target": player}).map(function(event) {
        var playerInfo = _playerInfo(player);
        playerInfo.damage = event.damage;
        return {
            event: "hit",
            data: playerInfo
        }
    }));
    return damages;
}

function endMessage(winner) {

    var message = {
        type: "end",
        data: {
            winner: {
                team: winner
            }
        }
    };

    return message;
}

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

function destroyedEventMessage(player) {
    return {
        event: "die",
        data: _playerInfoWithPosition(player)
    }
}

function _playerInfoWithPosition(player) {
    return _playerInfo(player, true);
}

function _playerInfoWithPositionAndHp(player) {
    return _playerInfo(player, true, true);
}


function _playerInfo(player, includePosition, includeHp) {

    var info = {
        "id": player.id,
        "name": player.name,
        "team": player.team
    };

    if (includePosition) {
        info.x  = player.pos.x;
        info.y = player.pos.y;
    }

    if (includeHp) {
        info.hp = player.hp;
    }
    return info;
}

function getTeamStatusMessage(players, team) {
    var bots = _.where(players, {team: team, active: true}).map(_playerInfoWithPositionAndHp);
    return {
        event: "team",
        data: bots
    }
}

function getMessagesByTeam(func) {
    return function(events, players, team) {
        return _.reduce(players, function(memo, player) {
            if (player.team === team) {
                return memo.concat(func(events, player));
            } else {
                return memo;
            }
        }, []);
    }
}

module.exports = {
    getRoundStartMessage: getRoundStartMessage,
    getMessages: getMessages,
    getMoveMessagesByPlayer: getMoveMessagesByPlayer,
    getRadarMessagesByPlayer: getRadarMessagesByPlayer,
    getCannonMessagesByPlayer: getCannonMessagesByPlayer,
    getNoActionMessagesByTeam: getNoActionMessagesByTeam,
    getMoveMessagesByTeam: getMessagesByTeam(getMoveMessagesByPlayer),
    getRadarMessagesByTeam: getMessagesByTeam(getRadarMessagesByPlayer),
    getDetectedMessagesByTeam: getMessagesByTeam(getDetectedMessagesByPlayer),
    getCannonMessagesByTeam: getMessagesByTeam(getCannonMessagesByPlayer),
    destroyedEventMessage: destroyedEventMessage,
    getTeamStatusMessage: getTeamStatusMessage,
    startMessage: startMessage,
    endMessage: endMessage
}