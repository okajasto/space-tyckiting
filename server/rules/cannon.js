var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules) {
    return _.flatten(tools.filterActionsByType(actions, "cannon").map(_.partial(_handleBlast, world.bots, rules.cannon, 2)));
}

function applyEvents(events, world, rules) {
    events.forEach(function(cannon) {
        _.where(world.bots, {id: cannon.target.id}).map(function(player) {
            player.hp -= cannon.damage;
        });
    });
    // Instead of mutating -> clone
    return world;
}

function _handleBlast(tanks, radius, directDamage, action) {
    return _.filter(tanks, _.partial(tools.isInside, action, radius)).map(function(tank) {
        return {
            source: _.where(tanks, {id: action.id}),
            target: tank,
            damage: tools.isDirect(tank.pos, action) ? directDamage : 1
        }
    });
}

function messages(events, world, rules) {
    return events.reduce(function(memo, event) {
        return memo.concat(hitMessage(event)).concat(damageMessage(event));
    }, []);
}

function damageMessage(event) {
    var botInfo = tools.botInfo(event.target);
    botInfo.damage = event.damage;

    return tools.createMessage(event.target.player, {
        event: "hit",
        data: botInfo
    });
}


function hitMessage(event) {
    return tools.createMessage(event.source.player, {
        event: "hit",
        source: tools.botInfo(event.source),
        data: tools.botInfo(event.target)
    });
}

module.exports = {
    events: events,
    applyEvents: applyEvents,
    messages: messages
}