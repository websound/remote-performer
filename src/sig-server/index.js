var attachWSS = require('./ws-server.js')
var Hapi = require('hapi')
var path = require('path')

exports = module.exports

exports.start = (port, callback) => {
  if (typeof port === 'function') {
    callback = port
    port = undefined
  }
  var options = {
    connections: {
      routes: {
        cors: true
      }
    }
  }

  var httpListener = new Hapi.Server(options)

  httpListener.connection({
    port: port || Number(process.env.PORT) || 9090
  })

  httpListener.register(require('inert'), function (err) {
    if (err) {
      throw err
    }

    httpListener.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: path.join(__dirname, '../public')
        }
      }
    })

    httpListener.start(function (err) {
      if (err) {
        throw err
      }

      console.log('Server running at:', httpListener.info.uri)
      httpListener.peers = attachWSS(httpListener).peers
      callback(null, httpListener.info)
    })
  })

  return httpListener
}

