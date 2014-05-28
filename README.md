LiveBand.js
===========

**In development**

This project is intended to enable multiple users to collaboratively play music in real-time by leveraging the [Web MIDI API](http://www.w3.org/TR/webmidi/) and [Web Audio API](http://www.w3.org/TR/webaudio/).

The initial stack uses [WebSockets](http://www.w3.org/TR/websockets/) via [Node.js](https://github.com/joyent/node) to stream data from client to client. However, a faster P2P connection via [WebRTC](http://www.w3.org/TR/webrtc/) may be necessary (and is feasible now that Firefox and Chrome 31+ support SCTP-based reliable DataChannels<sup>[[1]](http://peerjs.com/status)</sup>). The goal would be to reach a latency of less than 30ms, the bound of human perception.<sup>[[2]](http://cacm.acm.org/magazines/2006/11/5793-enabling-network-centric-music-performance-in-wide-area-networks/fulltext)</sup> Initial informal tests with WebSockets and Heroku do not meet this requirement due to latency and jitter, so stricter requirements may be necessary, e.g. WebRTC, low latency connections, P2P within a metropolitan area network or Internet2, etc.

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
    1. Clone repository: `git clone https://github.com/vine77/liveband.git; cd liveband;`
    2. Install dependencies: `npm install`
    3. Start server: `node server`
    4. Browse to [http://localhost:5000](http://localhost:5000)
4. Or go a Heroku deployment at [http://liveband.io](http://liveband.io)
