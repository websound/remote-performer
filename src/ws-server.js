var WebSocketServer = require('ws').Server

module.exports = function attachWSS (server) {
  // Websocket server
  var wss = new WebSocketServer({server: server.listener})

  wss.broadcast = function broadcast (data, flags) {
    wss.clients.forEach(function each (client) {
      client.send(data, flags)
    })
  }

  console.log('websocket server created')
  wss.on('connection', function (ws) {
    ws.broadcast = function broadcast (data, flags) {
      wss.clients.forEach(function bc (client) {
        if (client === ws) return
        client.send(data, flags)
      })
    }

    ws.on('message', function (data, flags) {
      if (flags.binary) { // If received binary message, i.e. MIDI
        console.log('MIDI:', data)
        wss.broadcast(data, {binary: true}) // Echo MIDI message back to client
      }
    })

    console.log('websocket connection open')
    ws.on('close', function () {
      console.log('websocket connection close')
    })
  })
}
