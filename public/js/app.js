(function () {
  "use strict";
  var App = {};
  App.load = function () {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(function (midiAccess) {
        if (midiAccess.inputs().length === 0) {
          window.alert('No MIDI devices detected. Please connect a MIDI device and reload the app.');
        } else {
          for (var i = 0; i < midiAccess.inputs().length; i++) {
            midiAccess.inputs()[i].onmidimessage = App.handleMidi;
          }
        }
      }, function () {
        window.alert('Your browser does not support MIDI input. Please use Google Chrome Canary.');
      });
    } else {
      window.alert('Your browser does not support MIDI input. Please use Google Chrome Canary.');
    }
  };
  App.handleMidi = function (event) {
    console.log('MIDI:', event.data);
  };
  App.load();
})();
