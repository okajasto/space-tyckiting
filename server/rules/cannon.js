var _ = require('lodash');
var tools = require('rules/tools');

function events(actions, world, rules) {
    return _.flatten(tools.filterPlayersByEventType(actions, "cannon").map(_.partial(_handleBlast, world.players, rules.cannonRadius, 2)));
}

function apply(events, world, rules) {
    events.forEach(function(cannon) {
        _.where(world.players, {id: cannon.target.id}).map(function(player) {
            player.hp -= cannon.damage;
        });
    });
    // Instead of mutating -> clone
    return world;
}

function _handleBlast(tanks, radius, directDamage, action) {
    return _.filter(tanks, _.partial(tools.isInside, action, radius)).map(function(tank) {
        return {
            source: action.id,
            target: tank,
            damage: tools.isDirect(tank.pos, action) ? directDamage : 1
        }
    });
}

function messages(events, world, rules) {
    return events.reduce(function(memo, event) {
        return memo.concat(hitMessage(event)).concat(damageMessage(event));
    }, [])
}

function damageMessage(event) {
    var playerInfo = tools.playerInfo(event.target.team);
    playerInfo.damage = event.damage;
    return tools.createMessage(event.target, {
        event: "hit",
        data: playerInfo
    });
}


function hitMessage(event) {
    return tools.createMessage(event.source.team, {
        event: "hit",
        data: tools.playerInfo(event.target)
    });
}

module.exports = {
    events: events,
    apply: apply,
    messages: messages
}