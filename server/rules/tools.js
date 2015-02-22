var _ = require('lodash');

function filterActionsByType(actions, type) {
    return _.where(actions, {type: type});
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

function botInfoWithPosition(bot) {
    return botInfo(bot, true);
}

function botInfoWithPositionAndHp(bot) {
    return botInfo(bot, true, true);
}

function botInfo(bot, includePosition, includeHp) {
    var info = {
        "id": bot.id,
        "name": bot.name,
        "player": bot.player
    };

    if (includePosition) {
        info.x  = bot.pos.x;
        info.y = bot.pos.y;
    }

    if (includeHp) {
        info.hp = bot.hp;
    }
    return info;
}

module.exports = {
    filterActionsByType: filterActionsByType,
    inDistance: inDistance,
    isInside: isInside,
    isDirect: isDirect,
    botInfoWithPosition: botInfoWithPosition,
    botInfoWithPositionAndHp: botInfoWithPositionAndHp,
    botInfo: botInfo,
    createMessage: createMessage
}