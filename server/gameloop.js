var gameLoop = function(counter, actions, world, rules, config) {

    return rules.reduce(function(state, rule, counter) {
        var ruleEvents = [];
        var newState = state.world;
        var newMessages = [];

        if (_.isFunction(rule.events)) {
            ruleEvents = rule.events(newState, actions, config, counter);
        }
        if (_.isFunction(rule.applyEvents)) {
            newState = rule.applyEvents(ruleEvents, newState, config);
        }
        if (_.isFunction(rule.messages)) {
            newMessages = rule.messages(ruleEvents, newState, config);
        }
        return {
            world: newState,
            events: state.events.concat(ruleEvents),
            messages: state.messages.concat(newMessages)
        }
    }, { world: world, events: [], messages: []});

};

module.exports = gameLoop;