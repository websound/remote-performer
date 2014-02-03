var http = require('http');
var WebSocketServer = require('ws').Server;
var express = require('express');
var logfmt = require('logfmt');
var app = express();
var port = Number(process.env.PORT || 5000);

// Static server
app.use(logfmt.requestLogger());
app.use(express.static(__dirname + '/public'));
var server = http.createServer(app);
server.listen(port);
console.log('http server listening on %d', port);

// Websocket server
var wss = new WebSocketServer({server: server});
console.log('websocket server created');
wss.on('connection', function(ws) {
  ws.on('message', function(data, flags) {
    if (flags.binary) {  // If received binary message, i.e. MIDI
      console.log('MIDI:', data);
      ws.send(data, {binary: true});  // Echo MIDI message back to client
    }
  });
  console.log('websocket connection open');
  ws.on('close', function() {
    console.log('websocket connection close');
  });
});
