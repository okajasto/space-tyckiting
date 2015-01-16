// Starts game client

var express = require('express');
var argv = require('minimist')(process.argv.slice(2));


var aiName = argv.ai || 'dummy';
var port = argv.port || 4000;

var app = express();
app.use('/app/bots/_current', express.static(__dirname + '/client/ai/' + aiName));
app.use('/app', express.static(__dirname + '/client'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.listen(port, function() {
    console.log('\n*** Space Tyckiting AI ***\n');
    console.log(' - AI:', aiName);
    console.log(' - URL: http://localhost:' + port);
});
