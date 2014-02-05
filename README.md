LiveBand.js
===========

**In development**

This project is intended to enable multiple users to collaboratively play music in real-time by leveraging the [Web MIDI API](http://www.w3.org/TR/webmidi/) and [Web Audio API](http://www.w3.org/TR/webaudio/).

The initial stack will use [WebSockets](http://www.w3.org/TR/websockets/) via [Node.js](https://github.com/joyent/node) to stream data from client to client (although [WebRTC](http://www.w3.org/TR/webrtc/) should also be evaluated for P2P now that Firefox and Chrome 31+ support SCTP-based reliable DataChannels<sup>[[1]](http://peerjs.com/status)</sup>). Testing needs to be done to determine the requiements for reaching latency of less than 30ms, the bound of human perception.<sup>[[2]](http://cacm.acm.org/magazines/2006/11/5793-enabling-network-centric-music-performance-in-wide-area-networks/fulltext)</sup>

      +---------------------------+    +--------------+    +---------------------------+
      |         Client 1          |    |    Server    |    |          Client 2         |
      |---------------------------|    |--------------|    |---------------------------|
      |  +-------------+          |    |              |    |  +--------+    +-------+  |
      |  | Web MIDI IN |------------------------------------->|  Soft  |--->|  DAC  |  |
      |  | Drum machine|   |      |    |              |    |  | synths |    |  OUT  |  |
      |  +-------------+   |      |    |              |    |  +--------+    +------ +  |
      |                    v      |    |  WebSockets  |    |      ^                    |
      |  +-------+    +--------+  |    |              |    |      |   +-------------+  |
      |  |  DAC  |<---|  Soft  |  |    |              |    |      |   | Web MIDI IN |  |
      |  |  OUT  |    | synths |<-------------------------------------|   Keyboard  |  |
      |  +-------+    +--------+  |    |              |    |          +-------------+  |
      +---------------------------+    +--------------+    +---------------------------+

## Getting started

Plug your keyboard directly into your web browser

1. Plug in a MIDI controller
2. Open Chrome Canary
3. Try it out yourself:
    1. Clone repository: git clone https://github.com/vine77/liveband.git; cd liveband;
    2. Install dependencies: npm install
    3. Start server: node server
    4. Browse to http://localhost:5000
4. Or go a Heroku deployment at http://liveband.io
