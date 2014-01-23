var express = require('express');
var logfmt = require('logfmt');
var server = express();

server.use(logfmt.requestLogger());
server.use(express.static(__dirname + '/public'));

var port = Number(process.env.PORT || 5000);
server.listen(port, function () {
  console.log("Listening on " + port);
});
