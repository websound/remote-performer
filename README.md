Remote Performance example using WebMIDI and WebRTC
===================================================

> WIP: Currently implemented as a WebSocket broadcast triggering chromatic notes via the Web Audio API

## Usage

1. Clone repository: `$ git clone git@github.com:websound/RemotePerformer.git; cd midisocket;`
2. Install dependencies: `$ npm install`
3. Start server: `$ npm start`
4. Plug a MIDI controller into an available port
5. Point your browser to [http://localhost:9090](http://localhost:9090) (Google Chrome Only)
6. Download [ngrok](https://ngrok.com/) 
7. Move to the directory containing ngrok and expose your local web server at port 9090 `$ ./ngrok http 9090`
8. Share your ngrok generated URL and Play!

-

_This code originated from a fork of [midisocket](https://github.com/vine77/midisocket)_
