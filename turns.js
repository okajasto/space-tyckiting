var fs = require('fs');
var _ = require('lodash');


var data = JSON.parse(fs.readFileSync(process.argv[2]));

console.log(data.turns.length);