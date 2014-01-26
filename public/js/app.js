(function () {
  "use strict";
  var App = {};
  App.load = function () {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(function (midiAccess) {
        var inputs = midiAccess.inputs();
        if (inputs.length > 0) {
          for (var i = 0; i < inputs.length; i++) {
            inputs[i].onmidimessage = App.handleMidi;
          }
        } else {
          window.alert('No MIDI devices detected. Please connect a MIDI device and reload the app.');
        }
      }, function () {
        window.alert('Your browser does not support MIDI input. Please use Google Chrome Canary.');
      });
    } else {
      window.alert('Your browser does not support MIDI input. Please use Google Chrome Canary.');
    }
  };
  App.handleMidi = function (event) {
    var type = event.data[0] >> 4;
    var channel = event.data[0] & 0x0F;
    var pitch = event.data[1];
    var velocity = event.data[2];
    var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    switch (type) {
      // Note on
      case 9:
        if (velocity != 0) {
          var octave = Math.floor(pitch/12) - 1;
          var note = notes[pitch % 12];
          //console.log('Note On: ', pitch);
          $('#console').prepend(note + '<sub>' + octave + '</sub><br>');
          break;
        }
      // Note off
      case 8:
        //console.log('Note Off: ', pitch);
        break;
    }
  };
  App.load();
})();
