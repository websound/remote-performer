var SimplePeer = require('simple-peer')
var EE = require('events').EventEmitter
var util = require('util')
var lpstream = require('length-prefixed-stream')
var io = require('socket.io-client')

exports = module.exports = PeerBridge

util.inherits(PeerBridge, EE)

function PeerBridge () {
  if (!(this instanceof PeerBridge)) {
    return new PeerBridge()
  }

  this.conns = {}
  this.id = (~~(Math.random() * 1e9)).toString(36) + Date.now()

  this.setUp = (sigUrl, callback) => {
    var sioClient = io.connect(sigUrl, {
      transports: ['websocket'],
      'force new connection': true
    })
    sioClient.once('connect_error', callback)
    sioClient.on('connect', () => {
      sioClient.emit('ss-join', this.id)
      sioClient.on('ws-handshake', incommingDial.bind(this))
      sioClient.on('ws-peer', peerDiscovered.bind(this))
      callback()
    })

    function incommingDial (offer) {
      if (offer.answer) {
        return
      }

      const channel = new SimplePeer({ trickle: false })

      channel.on('connect', () => {
        this.conns[offer.srcId] = {
          channel: channel,
          lps: {
            encode: lpstream.encode(),
            decode: lpstream.decode()
          }
        }

        this.conns[offer.srcId].lps.encode
          .pipe(this.conns[offer.srcId].channel)
          .pipe(this.conns[offer.srcId].lps.decode)
          .on('data', (data) => {
            this.emit('msg', data)
          })
        this.emit('peer', offer.srcId)
      })

      channel.on('signal', function (signal) {
        offer.signal = signal
        offer.answer = true
        sioClient.emit('ss-handshake', offer)
      })

      channel.signal(offer.signal)
    }

    function peerDiscovered (_id) {
      var intentId = (~~(Math.random() * 1e9)).toString(36) + Date.now()
      var channel = new SimplePeer({ initiator: true, trickle: false })

      channel.on('signal', (signal) => {
        sioClient.emit('ss-handshake', {
          intentId: intentId,
          srcId: this.id,
          dstId: _id,
          signal: signal
        })
      })

      sioClient.on('ws-handshake', (offer) => {
        if (offer.intentId !== intentId || !offer.answer) {
          return
        }

        channel.on('connect', () => {
          this.conns[_id] = {
            channel: channel,
            lps: {
              encode: lpstream.encode(),
              decode: lpstream.decode()
            }
          }

          this.conns[_id].lps.encode
            .pipe(this.conns[_id].channel)
            .pipe(this.conns[_id].lps.decode)
            .on('data', (data) => {
              this.emit('msg', data)
            })

          this.emit('peer', _id)
        })
        channel.signal(offer.signal)
      })
    }
  }

  this.broadcast = (buf) => {
    Object.keys(this.conns).forEach((key) => {
      this.conns[key].lps.encode.write(buf)
    })
  }

  this.send = (id, buf) => {
    this.conns[id].lps.encode.write(buf)
  }
}

