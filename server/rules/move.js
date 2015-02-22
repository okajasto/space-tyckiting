var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules) {
    return _.flatten(tools.filterActionsByType(actions, "move").map(_.partial(_handleMove, rules.move, rules.width, rules.height, world)));
}

function applyEvents(moves, world, rules) {
    moves.forEach(function(move) {
        _.where(world.bots, {id: move.target.id}).map(function(bot) {
            bot.pos = {x: move.x, y: move.y};
        });
    });
    // TODO clone
    // var newWorld = world;
    // newWorld.bots = bots;
    // return newWorld;
    return world;
}

function _handleMove(moveLength, maxWidth, maxHeight, world, action) {

    var bot = _.findWhere(world.bots, {id: action.id});

    console.log("BOT %s ->", action.id,  bot);

    if (!bot) {
        return [];
    } else if (tools.isInside(action, moveLength, bot)) {
        var x = action.x;
        var y = action.y;

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
            target: bot,
            x: x,
            y: y
        };
    } else {
        return {
            target: bot,
            x: bot.pos.x,
            y: bot.pos.y
        };
    }
}

function messages(events) {
    return events.map(function(event) {
        var botInfo = tools.botInfo(event.target);
        botInfo.x = event.x;
        botInfo.y = event.y;
        return tools.createMessage(event.target.player, {
            event: "move",
            data: botInfo
        });
    });
}

module.exports = {
    events: events,
    applyEvents: applyEvents,
    messages: messages
}