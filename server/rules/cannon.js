var _ = require('lodash');
var tools = require('./tools.js');

function events(actions, world, rules) {
    return _.flatten(tools.filterPlayersByEventType(actions, "cannon").map(_.partial(_handleBlast, world.players, rules.cannon, 2)));
}

function applyEvents(events, world, rules) {
    events.forEach(function(cannon) {
        _.where(world.players, {id: cannon.target.id}).map(function(player) {
            player.hp -= cannon.damage;
        });
    });
    // Instead of mutating -> clone
    return world;
}

function _handleBlast(tanks, radius, directDamage, action) {
    return _.filter(tanks, _.partial(tools.isInside, action.action, radius)).map(function(tank) {
        return {
            source: action,
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
    var playerInfo = tools.playerInfo(event.target);
    playerInfo.damage = event.damage;

    return tools.createMessage(event.target.team, {
        event: "hit",
        data: playerInfo
    });
}


function hitMessage(event) {
    return tools.createMessage(event.source.team, {
        event: "hit",
        source: tools.playerInfo(event.source),
        data: tools.playerInfo(event.target)
    });
}

module.exports = {
    events: events,
    applyEvents: applyEvents,
    messages: messages
}