var _ = require('lodash');
var fs = require('fs');

var logCounter = 0;

function getStartData(teams, players) {
    return teams.map(function(team, index) {
        return {
            id: index,
            team: team,
            bots: _botsByTeam(team, players)
        }
    });
}

function _botsByTeam(team, players) {
    return _.where(players, {team: team}).map(function(bot) {
        return {
            "id": bot.id,
            "name": bot.name,
            "x": bot.pos.x,
            "y": bot.pos.y
        }
    });
}

function _mapAction(bot, action) {
    return {
        botId: bot.id,
        x: action.x,
        y: action.y
    }
}

function _mapMoveActions(players) {
    return _.reduce(players, function(result, player) {
        if (player.action && player.action.type === "move") {
            result.push(_mapAction(player, {
                x: player.pos.x,
                y: player.pos.y
            }));
        }
        return result;
    }, []);
}

function _mapActions(players, action) {
    return _.reduce(players, function(result, player) {
        if (player.action && player.action.type === action) {
            result.push(_mapAction(player, player.action));
        }
        return result;
    }, []);
}

/**
 * Must be called after actions are applied
 *
 * @param players
 * @returns {{radars: *, moves: *, cannons: *}}
 */
function getTurnActions(players) {
    return {
        radars: _mapActions(players, "radar"),
        moves: _mapMoveActions(players),
        cannons: _mapActions(players, "cannon")
    }
}

function writeLog(teams, winner, logData) {
    var resolution = _.isUndefined(winner) || winner === null ? "draw" : winner;
    var fileName = (logCounter++) + "_" + teams[0] + "_vs_" + teams[1] + "_" + resolution + '.json';

    function performWrite() {
        fs.writeFile('logs/' + fileName, JSON.stringify(logData), function (err) {
            if (err) {
                throw err;
            }
        });
    }

    fs.exists('logs', function(exists) {
        if (exists) {
            performWrite();
        } else {
            fs.mkdir("logs", function(err) {
                if (err) {
                    throw err;
                }
                performWrite();
            });
        }
    });
}

module.exports = {
    getStartData: getStartData,
    getTurnActions: getTurnActions,
    writeLog: writeLog
}
