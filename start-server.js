// Starts game server

var express = require('express');
var http = require('http');
var WebSocketServer = require('ws').Server;

var game = require('./server/game.js');

var config = {
    bots: 3,
    width: 28,
    height: 28,
    move: 2,
    startHp: 10,
    cannon: 1,
    radar: 3,
    see: 2,
    maxCount: 200,
    loopTime: 300
};

var port = 3000;

//var app = express();
//var server = app.listen(port, function() {
    console.log('\n*** Space Tyckiting Server ***\n');
    console.log('Listening at http://localhost:' + port);
    console.log('\nStart your AIs now!');
//});
//var wsServer = io.listen(server); */

var wss = new WebSocketServer({port: port});

game(config).startListening(wss);
