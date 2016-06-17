/* eslint-env mocha */
'use strict'

var expect = require('chai').expect
// var parallel = require('run-parallel')
var webrtcsupport = require('webrtcsupport')

// Cause Phantom doesn't have any WebRTC support
if (!webrtcsupport.support) {
  return
}

var PeerBridge = require('../../src').PeerBridge

describe('peer bridge', () => {
  var sigUrl = 'http://localhost:15555'
  var p1
  var p2

  it('Create PeerBridge 1', (done) => {
    p1 = new PeerBridge()
    done()
  })

  it('Create PeerBridge 2', (done) => {
    p2 = new PeerBridge()
    done()
  })

  it('Set Up PeerBridge 1', (done) => {
    p1.setUp(sigUrl, done)
  })

  it('Set Up PeerBridge 2', (done) => {
    p1.on('peer', (id) => {
      expect(id).to.equal(p2.id)
      done()
    })
    p2.setUp(sigUrl, () => {})
  })

  it('Broadcast', (done) => {
    p2.once('msg', (data) => {
      expect(data.toString()).to.equal('hey')
      done()
    })

    p1.broadcast(new Buffer('hey'))
  })
})
