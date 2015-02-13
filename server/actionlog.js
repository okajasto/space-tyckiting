var _ = require('lodash');
var fs = require('fs');

var logCounter = -1;

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
    var fileName = teams[0] + "_vs_" + teams[1] + "_" + resolution + '.json';
    fileName = fileName.replace(/ /g, '_');

    function performWrite(counter) {
        fs.writeFile('logs/' + counter + "_" + fileName, JSON.stringify({teams: logData.teams, turns: logData.turns}), function (err) {
            if (err) {
                throw err;
            }
        });
        fs.writeFile('logs/messages_' + counter + "_" + fileName, JSON.stringify(logData.messages), function(err) {
            if (err) {
                throw err;
            }
        });
    }

    fs.exists('logs', function(exists) {
        if (exists) {
            if (logCounter < 0) {
                // Minor optimization. Let's fetch next counter lazily.
               logCounter = _getNextCounter();
            }
            performWrite(logCounter++);
        } else {
            fs.mkdir("logs", function(err) {
                if (err) {
                    throw err;
                }
                logCounter = 0;
                performWrite(logCounter++);
            });
        }
    });
}

function _getNextCounter() {
    // Let's check this synchronously.
    var files = fs.readdirSync("logs");
    var lastCounter = 0;
    if (!_.isEmpty(files)) {
        var counters = files.map(function(file) {
            var counter = file.split('_');
            if (counter && counter.length > 0) {
                var value = parseInt(counter[0], 10);
                if (value > 0) {
                    return value;
                }
            }
            return 0;
        });
        lastCounter = _.max(counters);
    }
    return lastCounter + 1;
}

module.exports = {
    getStartData: getStartData,
    getTurnActions: getTurnActions,
    writeLog: writeLog
};