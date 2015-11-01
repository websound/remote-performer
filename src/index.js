var WebSocketServer = require('ws').Server
var Hapi = require('hapi')

var server = new Hapi.Server({})

server.connection({
  port: Number(process.env.PORT) || 9090
})

server.register(require('inert'), function (err) {
  if (err) {
    throw err
  }

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: __dirname + '/public'
      }
    }
  })

  server.start(function (err) {
    if (err) {
      throw err
    }

    console.log('Server running at:', server.info.uri)
    attachWSS()
  })
})

function attachWSS () {
  // Websocket server
  var wss = new WebSocketServer({server: server.listener})
  console.log('websocket server created')
  wss.on('connection', function (ws) {
    ws.on('message', function (data, flags) {
      if (flags.binary) { // If received binary message, i.e. MIDI
        console.log('MIDI:', data)
        ws.send(data, {binary: true}) // Echo MIDI message back to client
      }
    })
    console.log('websocket connection open')
    ws.on('close', function () {
      console.log('websocket connection close')
    })
  })
}
