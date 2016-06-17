'use strict'

const log = console.log
const SocketIO = require('socket.io')

module.exports = (http) => {
  const io = new SocketIO(http.listener)

  io.on('connection', handle)

  const peers = {}

  this.peers = () => {
    return peers
  }

  function safeEmit (addr, event, arg) {
    const peer = peers[addr]
    if (!peer) {
      log('trying to emit %s but peer is gone', event)
      return
    }

    peer.emit(event, arg)
  }

  function handle (socket) {
    socket.on('ss-join', join.bind(socket))
    socket.on('ss-leave', leave.bind(socket))
    socket.on('disconnect', disconnect.bind(socket)) // socket.io own event
    socket.on('ss-handshake', forwardHandshake)
  }

  // join this signaling server network
  function join (id) {
    peers[id] = this // socket
    Object.keys(peers).forEach((_id) => {
      if (_id === id) {
        return
      }
      // broadcast the new peer
      safeEmit(_id, 'ws-peer', id)
    })
  }

  function leave (multiaddr) {
    if (peers[multiaddr]) {
      delete peers[multiaddr]
    }
  }

  function disconnect () {
    Object.keys(peers).forEach((mh) => {
      if (peers[mh].id === this.id) {
        delete peers[mh]
      }
    })
  }

  // forward an WebRTC offer to another peer
  function forwardHandshake (offer) {
    if (offer.answer) {
      safeEmit(offer.srcId, 'ws-handshake', offer)
    } else {
      if (peers[offer.dstId]) {
        safeEmit(offer.dstId, 'ws-handshake', offer)
      } else {
        offer.err = 'peer is not available'
        safeEmit(offer.srcId, 'ws-handshake', offer)
      }
    }
  }

  return this
}
