App = (function() {
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
            inputs[i].onmidimessage = App.handleMidiEvent;
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
  App.noteToString = function (pitch) {
    if (!pitch) return null;
    var octave = Math.floor(pitch/12) - 1;
    return notes[pitch % 12] + '<sub>' + octave + '</sub><br>';
  };
  App.noteOn = function(pitch) {
    // Log note
    var note = App.noteToString(pitch);
    $('#console').prepend(note);
    App.activeNotes.push(pitch);

    // Play audio
    var frequency = 440 * Math.pow(2, (pitch - 69)/12);
    var source = App.audioContext.createBufferSource();
    source.playbackRate.value = frequency/440;
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
      App.audioSources[pitch].gain.setTargetAtTime(0.0, App.audioContext.currentTime, 0.1);
    }
  };
  App.handleMidiEvent = function (event) {
    App.handleMidi(event.data);
  };
  App.handleMidi = function(midiMessage) {
    var type = midiMessage[0] >> 4;
    var channel = midiMessage[0] & 0x0F;
    var pitch = midiMessage[1];
    var velocity = midiMessage[2];
    switch (type) {
      // Note on
      case 9:
        if (velocity !== 0) {
          App.noteOn(pitch);
          break;
        } else {
          // Note off
          App.noteOff(pitch);
          break;
        }
      // Note off
      case 8:
        App.noteOff(pitch);
        break;
    }
  };
  App.keyToMidi = function (key, isDown) {
    // Start index is 56 for G# below middle C
    var keyToNote = [81, 65, 87, 83, 68, 82, 70, 84, 71, 72, 85, 74, 73, 75, 79, 76, 186, 219, 222, 221];
    var pitch = (keyToNote.indexOf(key) !== -1) ? keyToNote.indexOf(key) + 56 : null;
    var type = (isDown) ? 9 : 8;
    var velocity = 127;
    if (!isDown || App.activeNotes.indexOf(pitch) === -1) App.handleMidi([(type << 4), pitch, velocity]);
  };
  window.addEventListener('load', function() {
    App.load();
  });
  $(document).keydown(function (e) {
    App.keyToMidi(e.which, true);
  });
  $(document).keyup(function (e) {
    App.keyToMidi(e.which, false);
  });
  return App;
})();
