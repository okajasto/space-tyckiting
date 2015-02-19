var _ = require('lodash');
var tools = require('rules/tools');

function events(actions, world, rules) {
    return _.flatten(tools.filterPlayersByEventType(actions, "move").map(_.partial(_handleMove, rules.moveLength, rules.maxWidth, rules.maxHeight, world)));
}

function apply(moves, world, rules) {
    moves.forEach(function(move) {
        _.where(world.players, {id: move.target.id}).map(function(player) {
            player.pos = {x: move.x, y: move.y};
        });
    });
    // TODO clone
    // var newWorld = world;
    // newWorld.players = players;
    // return newWorld;
    return world;
}

function _handleMove(moveLength, maxWidth, maxHeight, world, action) {

    var player = world.players[action.id];

    if (tools.isInside(action, moveLength, player)) {
        var x = player.action.x;
        var y = player.action.y;

        if (x < 0) {
            x = 0;
        }
        if (x >= maxWidth) {
            x = maxWidth - 1;
        }
        if (y < 0) {
            y = 0;
        }
        if (y >= maxHeight) {
            y = maxHeight - 1;
        }
        return {
            target: player,
            x: x,
            y: y
        };
    } else {
        return {
            target: player,
            x: player.pos.x,
            y: player.pos.y
        };
    }
}

function messages(events) {
    return events.map(function(event) {
        var playerInfo = _.playerInfo(event.target);
        playerInfo.x = event.x;
        playerInfo.y = event.y;
        return tools.createMessage(event.target, {
            event: "move",
            data: playerInfo
        });
    });
}

module.exports = {
    events: events,
    apply: apply,
    messages: messages
}