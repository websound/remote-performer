var attachWSS = require('./ws-server.js')
var Hapi = require('hapi')
var path = require('path')

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
        path: path.join(__dirname, '/public')
      }
    }
  })

  server.start(function (err) {
    if (err) {
      throw err
    }

    console.log('Server running at:', server.info.uri)
    attachWSS(server)
  })
})
