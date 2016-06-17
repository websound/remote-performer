/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const io = require('socket.io-client')
const parallel = require('run-parallel')

const sigServer = require('../../src/sig-server')

describe('signalling server', () => {
  const sioOptions = {
    transports: ['websocket'],
    'force new connection': true
  }

  let sioUrl
  let sigS
  let c1
  let c2
  let c3
  let c4

  let c1Id = '1'
  let c2Id = '2'
  let c3Id = '3'
  let c4Id = '4'

  it('start and stop signalling server (default port)', (done) => {
    const sigS = sigServer.start((err, info) => {
      expect(err).to.not.exist
      expect(info.port).to.equal(9090)
      expect(info.protocol).to.equal('http')
      expect(info.address).to.equal('0.0.0.0')
      sigS.stop(done)
    })
  })

  it('start and stop signalling server (custom port)', (done) => {
    const sigS = sigServer.start(12345, (err, info) => {
      expect(err).to.not.exist
      expect(info.port).to.equal(12345)
      expect(info.protocol).to.equal('http')
      expect(info.address).to.equal('0.0.0.0')
      sigS.stop(done)
    })
  })

  it('start signalling server for client tests', (done) => {
    sigS = sigServer.start(12345, (err, info) => {
      expect(err).to.not.exist
      expect(info.port).to.equal(12345)
      expect(info.protocol).to.equal('http')
      expect(info.address).to.equal('0.0.0.0')
      sioUrl = info.uri
      done()
    })
  })

  it('zero peers', () => {
    expect(Object.keys(sigS.peers).length).to.equal(0)
  })

  it('connect one client', (done) => {
    c1 = io.connect(sioUrl, sioOptions)
    c1.on('connect', done)
  })

  it('connect three more clients', (done) => {
    let count = 0

    c2 = io.connect(sioUrl, sioOptions)
    c3 = io.connect(sioUrl, sioOptions)
    c4 = io.connect(sioUrl, sioOptions)

    c2.on('connect', connected)
    c3.on('connect', connected)
    c4.on('connect', connected)

    function connected () {
      if (++count === 3) { done() }
    }
  })

  it('ss-join first client', (done) => {
    c1.emit('ss-join', c1Id)
    setTimeout(() => {
      expect(Object.keys(sigS.peers()).length).to.equal(1)
      done()
    }, 10)
  })

  it('ss-join and ss-leave second client', (done) => {
    c2.emit('ss-join', c2Id)
    setTimeout(() => {
      expect(Object.keys(sigS.peers()).length).to.equal(2)
      c2.emit('ss-leave', c2Id)
      setTimeout(() => {
        expect(Object.keys(sigS.peers()).length).to.equal(1)
        done()
      }, 10)
    }, 10)
  })

  it('ss-join and disconnect third client', (done) => {
    c3.emit('ss-join', c3Id)
    setTimeout(() => {
      expect(Object.keys(sigS.peers()).length).to.equal(2)
      c3.disconnect()
      setTimeout(() => {
        expect(Object.keys(sigS.peers()).length).to.equal(1)
        done()
      }, 10)
    }, 10)
  })

  it('ss-join the fourth', (done) => {
    c1.on('ws-peer', (_id) => {
      expect(_id).to.equal(c4Id)
      expect(Object.keys(sigS.peers()).length).to.equal(2)
      done()
    })
    c4.emit('ss-join', c4Id)
  })

  it('c1 handshake c4', (done) => {
    c4.once('ws-handshake', (offer) => {
      offer.answer = true
      c4.emit('ss-handshake', offer)
    })

    c1.once('ws-handshake', (offer) => {
      expect(offer.err).to.not.exist
      expect(offer.answer).to.equal(true)
      done()
    })

    c1.emit('ss-handshake', {
      srcId: c1Id,
      dstId: c4Id
    })
  })

  it('c1 handshake c2 fail (does not exist anymore)', (done) => {
    c1.once('ws-handshake', (offer) => {
      expect(offer.err).to.exist
      done()
    })

    c1.emit('ss-handshake', {
      srcId: c1Id,
      dstId: c2Id
    })
  })

  it('stop signalling server', (done) => {
    parallel([
      (cb) => {
        c1.disconnect()
        cb()
      },
      (cb) => {
        c2.disconnect()
        cb()
      },
      // done in test
      // (cb) => {
      //  c3.disconnect()
      //  cb()
      // },
      (cb) => {
        c4.disconnect()
        cb()
      }
    ], () => {
      sigS.stop(done)
    })
  })
})
