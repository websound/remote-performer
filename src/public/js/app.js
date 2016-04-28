/* globals location, WebSocket, $, AudioContext, XMLHttpRequest */

window.jQuery = window.$ = require('jquery')

var fs = require('fs')
var insertCss = require('insert-css')
var bootstrap = require('bootstrap/dist/js/bootstrap') // eslint-disable-line
var bsStyle = fs.readFileSync('./node_modules/bootstrap/dist/css/bootstrap.css')
insertCss(bsStyle)

/* Global App Object */
var App = {}

/* App Declarations */
App.audioContext = null
App.midiAccess = null
App.audioBuffer = null
App.audioSources = {}
App.activeNotes = []
App.socket = null
App.timestamp = 0
App.sumLatencies = 0
App.numberOfLatencies = 0
App.source
var context = new AudioContext()

/*
// Audio Globals, could be app globals(?)
var channels = 2
var bufferSampleSize = 22050
var sampleRate = 44100
var isOctaveKeyDown = false // Originally Redacted
*/

/* WebSocket Connection */
App.setupSocket = function () {
  var host = location.origin.replace(/^http/, 'ws')
  App.socket = new WebSocket(host)
  App.socket.binaryType = 'arraybuffer'
  App.socket.onmessage = function (event) {
    var midiMessage = new Uint8Array(event.data)
    if (midiMessage[0] >> 4 === 9) {
      App.handleMidi(midiMessage)
      // Log note on events from websockets
      $('#console').prepend('WS note: ' + midiMessage[1] + '<br>')
      var latency = window.performance.now() - App.timestamp
      App.sumLatencies = App.sumLatencies + latency
      App.numberOfLatencies++
      $('#console').prepend('WS roundtrip: ' + Math.ceil(latency) + '<br>')
      $('#averageLatency').html('Latency: ' + Math.ceil(App.sumLatencies / App.numberOfLatencies))
    }
  }
}

/* Load App */
App.load = function () {
  window.AudioContext = window.AudioContext || window.webkitAudioContext
  App.audioContext = new AudioContext()
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(function (midi) {
      App.midiAccess = midi // Required to prevent loss in MIDI input
      var inputs = App.midiAccess.inputs
      if (inputs.size > 0) {
        inputs.forEach(function (port, key) {
          port.onmidimessage = App.handleMidiEvent
        })
      } else {
        console.log('No MIDI devices detected. Please connect a MIDI device and reload the app.')
      }
    }, function () {
      window.alert('Your browser does not support MIDI input. Please use Google Chrome Canary.')
    })
  } else {
    window.alert('Your browser does not support MIDI input. Please use Google Chrome Canary.')
  }
  App.getPing()
  App.setupSocket()
}

/* TODO: Modularize ping play and note play, swappable testing components, then comment for just midi send */
var audioContext = new AudioContext()

App.getPing = function (url, cb) {
  var request = new XMLHttpRequest()

  request.open('GET', '../ping.wav', true)
  request.responseType = 'arraybuffer'
  request.onload = function () {
    var audioData = request.response

    // Wait 100ms for sample to download/decode.
    var startTime = audioContext.currentTime + 0.2

    App.audioContext.decodeAudioData(audioData, function (buffer) {
      App.source = App.audioContext.createBufferSource()
      App.source.buffer = buffer
      App.source.connect(App.audioContext.destination)
      App.source.start(startTime)
    },
    function (e) { 'Error with decoding audio data' + e.err })
  }
  request.send()
}

/* AUDIO */

// Chromatic Scale
var octave = 0
var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

App.noteToString = function (pitch) {
  if (!pitch) return null
  var octave = Math.floor(pitch / 12) - 1
  return notes[pitch % 12] + '<sub>' + octave + '</sub><br>'
}

// TODO: WHAT HAPPENS WHEN NOTES ARE PLAYED
App.noteOn = function (pitch) {
  // Log note
  var note = App.noteToString(pitch)
  $('#console').prepend(note)
  App.activeNotes.push(pitch)

  /* Play audio */
  var frequency = 440 * Math.pow(2, (pitch - 69) / 12)
  var source = App.audioContext.createBufferSource()

  source.playbackRate.value = frequency / 440
  source.loop = false
  source.connect(App.audioContext.destination)
  source.start(0)
  App.osc(frequency)
  App.audioSources[pitch] = source
}

App.osc = function (frequency) {  // Get this to play notes, then
  var osc = context.createOscillator()
  var gain = context.createGain()

  osc.type = 'square'
  osc.frequency.value = frequency
  // osc.frequency.setValueAtTime(frequency, 0.0)
  gain.value = 0.5

  osc.connect(gain)
  gain.connect(context.destination)

  osc.start(context.currentTime)
  osc.stop(context.currentTime + 0.1)
}

// Note timing optimization
App.noteOff = function (pitch) {
  var position = App.activeNotes.indexOf(pitch)
  if (position !== -1) {
    App.activeNotes.splice(position, 1)
    // App.audioSources[pitch].gain.setTargetAtTime(0.0, App.audioContext.currentTime, 0.1)
  }
}

/* MIDI */

// TODO: MIDI event time optimization
App.handleMidiEvent = function (event) {
  if (event.data[0] >> 4 === 9) App.timestamp = event.receivedTime
  App.handleMidi(event.data)
  App.socket.send(event.data.buffer)
}

// TODO: Optimize MIDI behavior
App.handleMidi = function (midiMessage) {
  var type = midiMessage[0] >> 4
  // var channel = midiMessage[0] & 0x0F
  var pitch = midiMessage[1]
  var velocity = midiMessage[2]
  switch (type) {
    case 9:
      if (velocity !== 0) {
        App.noteOn(pitch)
      } else {
        // Note off
        App.noteOff(pitch)
      }
      break
      // Note off
    case 8:
      App.noteOff(pitch)
      break
  }
}

// TODO: All needed parameters?
App.createMidiMessage = function (type, channel, pitch, velocity) {
  return {
    data: new Uint8Array([(type << 4) | channel, pitch, velocity]),
    receivedTime: window.performance.now()
  }
}

// TODO: Review key to MIDI mapping accuracy
App.keyToMidi = function (key, isKeyDown) {
  // Start index is 56 for G# below middle C
  var keyToNote = [81, 65, 87, 83, 68, 82, 70, 84, 71, 72, 85, 74, 73, 75, 79, 76, 186, 219, 222, 221]
  if (keyToNote.indexOf(key) !== -1) {
    var pitch = keyToNote.indexOf(key) + 56
    pitch = Math.max(0, pitch + octave * 12)
    var type = (isKeyDown) ? 9 : 8
    var velocity = 127
    if (!isKeyDown || App.activeNotes.indexOf(pitch) === -1) {
      App.handleMidiEvent(App.createMidiMessage(type, 0, pitch, velocity))
    }
  }
}

// App-load event listener
window.addEventListener('load', function () {
  App.load()
})

// Keyup/Keydown listener
$(document).keydown(function (e) {
  if (e.which === 90) { // Z
    octave--
  } else if (e.which === 88) { // X
    octave++
  } else {
    App.keyToMidi(e.which, true)
  }
})
$(document).keyup(function (e) {
  App.keyToMidi(e.which, false)
})
