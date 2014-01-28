(function() {
  "use strict";
  var App = {};
  var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  App.audioContext = null;
  App.midiAccess = null;
  App.audioBuffer = null;
  App.audioSources = {};
  App.activeNotes = [];
  App.load = function() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    App.audioContext = new AudioContext();
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(function(midi) {
        App.midiAccess = midi;  // Required to prevent loss in MIDI input
        var inputs = App.midiAccess.inputs();
        if (inputs.length > 0) {
          for (var i = 0; i < inputs.length; i++) {
            inputs[i].onmidimessage = App.handleMidi;
          }
        } else {
          window.alert('No MIDI devices detected. Please connect a MIDI device and reload the app.');
        }
      }, function() {
        window.alert('Your browser does not support MIDI input. Please use Google Chrome Canary.');
      });
    } else {
      window.alert('Your browser does not support MIDI input. Please use Google Chrome Canary.');
    }
    App.loadSounds();
  };
  App.loadSounds = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'ping.wav', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(event) {
      App.audioBuffer = App.audioContext.createBuffer(event.target.response, false);
    };
    xhr.send();
  };
  App.noteOn = function(pitch) {
    // Log note
    var octave = Math.floor(pitch/12) - 1;
    var note = notes[pitch % 12];
    $('#console').prepend(note + '<sub>' + octave + '</sub><br>');
    App.activeNotes.push(pitch);

    // Play audio
    var source = App.audioContext.createBufferSource();
    //var playbackRate = 1;
    //source.playbackRate.value = playbackRate;
    source.buffer = App.audioBuffer;
    source.loop = false;
    source.connect(App.audioContext.destination);
    source.noteOn(0);
    App.audioSources[pitch] = source;
  };
  App.noteOff = function(pitch) {
    var position = App.activeNotes.indexOf(pitch);
    if (position != -1) {
      App.activeNotes.splice(position, 1);
      App.audioSources[pitch].noteOff(0);
    }
  };
  App.handleMidi = function(event) {
    console.log('handleMidi:', event.data);
    var type = event.data[0] >> 4;
    var channel = event.data[0] & 0x0F;
    var pitch = event.data[1];
    var velocity = event.data[2];
    switch (type) {
      // Note on
      case 9:
        if (velocity !== 0) {
          App.noteOn(pitch);
          break;
        } else {
          // Note off
        }
      // Note off
      case 8:
        App.noteOff(pitch);
        break;
    }
  };
  window.addEventListener('load', function() {
    App.load();
  });
})();
