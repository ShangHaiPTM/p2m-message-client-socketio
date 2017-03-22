/**
 * Created by colinhan on 20/02/2017.
 */
const io = require('socket.io-client');
const client = require('p2m-message-client');

let _socket;
let _options;

function channel(options) {
  let events = {};
  let isConnected = false;
  function on(event, callback) {
    let list = events[event] = events[event] || [];
    list.push({cb: callback});

    if (event === 'connect') {
      if (isConnected) {
        callback(this);
      }
    }
    return this;
  }

  function emit(event, ...params) {
    let list = events[event];
    if (list) {
      list.map(e=>e.cb.apply(null, params));
    }
  }

  function start(opt2) {
    let self = this;
    _options = Object.assign({}, options, opt2);

    let fullPath = _options.serverUrl + _options.path;

    console.log("[SOCKET-IO] Socket-io client is starting...");
    _socket = io(fullPath, {transports: ['websocket', 'pulling']});
    _socket.on('connect', function () {
      console.log(`[SOCKET-IO] Connected to server at "${fullPath}"`);
      _socket.emit('register', {userId: _options.userId});
    });
    _socket.on('registered', function () {
      console.log(`[SOCKET-IO] Register success`);
      emit('connect', self);
    });
    _socket.on('push-message', function (message) {
      console.log(`[SOCKET-IO] Got a message`);
      client.delivered(message.pushId);

      emit('message', message, self);
    });
  }
  function stop() {
    console.log(`[SOCKET-IO] Stopping socket-io service`);
    _socket.disconnect();
    emit('disconnect', this);
  }

  return {start, stop, on, channelId: 'socket-io'};
}

module.exports = channel;