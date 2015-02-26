var _ = require('lodash');

function filterPlayersByEventType(players, type) {
    return _.filter(players, function(player) {
        return player.action && player.action.type === type;
    });
}

function inDistance(sourcePos, targetPos, distance) {
    return (Math.abs(sourcePos.x - targetPos.x) <= distance) && (Math.abs(sourcePos.y - targetPos.y) <= distance);
}

function isDirect(pos, target) {
    return pos.x === target.x && pos.y === target.y;
}

function isInside(source, radius, target) {
    var d = {
        x1: source.x - radius,
        x2: source.x + radius,
        y1: source.y - radius,
        y2: source.y + radius
    };
    return (d.x1 <= target.pos.x && target.pos.x <= d.x2) && (d.y1 <= target.pos.y && target.pos.y <= d.y2);
}

function createMessage(target, content) {
    return {
        target: target,
        content: content
    }
}

function playerInfoWithPosition(player) {
    return playerInfo(player, true);
}

function playerInfoWithPositionAndHp(player) {
    return playerInfo(player, true, true);
}

function playerInfo(player, includePosition, includeHp) {
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

module.exports = {
    filterPlayersByEventType: filterPlayersByEventType,
    inDistance: inDistance,
    isInside: isInside,
    isDirect: isDirect,
    playerInfoWithPosition: playerInfoWithPosition,
    playerInfoWithPositionAndHp: playerInfoWithPositionAndHp,
    playerInfo: playerInfo,
    createMessage: createMessage
}