define(["lodash", "svg"], function(_, SVG) {

    return function(root, width, height, blastRadius, detectRadius) {
        var width = width || 22;
        var height = height || 22;
        var blastRadius = blastRadius || 1;
        var detectRadius = detectRadius || 3;

        var red = "#f00";
        var green = "#0f0";
        var semiGreen = "#0a0";
        var darkGreen = "#090";

        var ships = {};
        var temp = [];

        var size = 20;
        var half = size / 2;

        var draw = SVG(root).size(width * size, height * size);
        var shipTemplate = draw.defs().polygon([[half, 0], [size, size], [0, size]]);

        _init();

        function _init() {
            var pattern = draw.pattern(20, 20, function(add) {
                add.rect(20,20).stroke({width: 1, color: darkGreen});
            });
            draw.rect("100%", "100%").fill(pattern);
        }

        function addShip(id, x, y, team) {
            var fill = team ? semiGreen : '#000';
            var color = green;
            ships[id] = draw.use(shipTemplate).fill(fill).stroke({ width: 1, color: color }).move(size * x, size * y);
        }

        function removeShip(id) {
            delete ships[id];
        }

        function hasShip(id) {
            return ships[id];
        }

        function moveShip(id, x, y) {
            if (ships[id]) {
                ships[id].animate(50).move(size * x, size * y);
            }
        }

        function destroyShip(id) {
            if (ships[id]) {
                ships[id].stroke({width: 2, color: '#777'}).fill('#777');
            }
        }

        function _rect(x, y, radius) {
            return draw.rect((radius*2+1) * size, (radius*2+1) * size).move((x -radius) * size, (y -radius) * size);
        }

        function blast(x1, y1, x2, y2) {
            var set = draw.group();
            set.add(draw.line(size * x1 + half, size * y1 + half, size * x2 + half, size * y2 + half).stroke({ width: 1, color: red }).back().forward());
            set.add(_rect(x2, y2, blastRadius).attr({
                fill: red,
                'fill-opacity': 0.4}));
            temp.push(set);
        }

        function radar(x1, y1, x2, y2) {

            var startX = size * x1 + half;
            var startY = size * y1 + half;

            var set = draw.group();
            set.add(draw.line(startX, startY, x2 * size + half, y2 * size + half).stroke({ width: 1, color: semiGreen}).back().forward());
            set.add(_rect(x2, y2, detectRadius)).attr({
                fill: green,
                'fill-opacity': 0.4});

            temp.push(set);
        }

        function clear() {
            temp.forEach(function(elem) {
                elem.remove();
            });
            temp = [];
        }

        function clearAll() {
            clear();
            _.each(ships, function(ship){
                ship.remove();
            });
            temp = [];
            ships = {};
            _init();
        }

        return {
            radar: radar,
            blast: blast,
            addShip: addShip,
            hasShip: hasShip,
            moveShip: moveShip,
            removeShip: removeShip,
            destroyShip: destroyShip,
            clear: clear,
            clearAll: clearAll
        }
    }
});