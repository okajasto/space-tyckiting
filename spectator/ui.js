define([
    'jquery',
    'lodash'],
    function(
        $,
        _)
    {

    return function() {

        var statusTemplate =
            '<li class="status" data-id="<%= id %>">' +
            '   <span class="idbox <%= team %>"></span>' +
            '   <span class="name"><%= name %></span>' +
            '   <span class="hp"><%= hp %></span> /' +
            '   <span class="max"><%= max %></span>' +
            '</li>';

        var $statusArea = $('#team .statuses');

        function addBot(bot, isFirstTeam, config) {
            if ($statusArea.find('[data-id="' + bot.id + '"]').length === 0) {
                $statusArea.append(
                    _.template(statusTemplate, {
                        team: isFirstTeam ? "filled" : "bordered",
                        id: bot.id,
                        name: bot.name,
                        hp: bot.hp,
                        max: config.startHp
                    })
                );
            }
        }

        function updateBot(bot) {
            var $status = $statusArea.find('.status[data-id="' + bot.id + '"]');
            if ($status.length > 0) {
                $status.find(".hp").html(bot.hp);
                if (bot.hp <= 0) {
                    $status.find('.idbox').removeClass("filled bordered").addClass("destroyed");
                }
            }
        }

        function reset() {
            $statusArea.html('');
        }

        function hasBot(id) {
            return $statusArea.find('[data-id="' + id + '"]').length > 0
        }

        return {
            addBot: addBot,
            updateBot: updateBot,
            hasBot: hasBot,
            reset: reset
        }
    }
});
