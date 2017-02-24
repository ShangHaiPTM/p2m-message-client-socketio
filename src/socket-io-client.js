/**
 * Created by colinhan on 20/02/2017.
 */

require('whatwg-fetch');
const io = require('socket.io-client');

let _socket;
let _options;
exports.start = function(options) {
  let fullPath = options.serverUrl + options.path;

  console.log("[SOCKET-IO] Socket-io client is starting...")
  _options = options;
  _socket = io(fullPath);
  _socket.on('connect', function () {
    console.log(`[SOCKET-IO] Connected to server at "${fullPath}"`);
    _socket.emit('register', {userId: options.userId});
  });
  _socket.on('registered', function () {
    console.log(`[SOCKET-IO] Register success`);
    if (typeof options.onConnected == "function") {
      options.onConnected(message);
    }
  });
  _socket.on('push-message', function (message) {
    console.log(`[SOCKET-IO] Got a message`);
    self.fetch(`${fullPath}/delivered`, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({pushId: message.pushId}),
      credentials: 'include',
    }).then(()=> {
      console.log(`[SOCKET-IO] Set message as delivered success.`);
    });

    if (typeof options.onMessage == "function") {
      options.onMessage(message);
    }
  });
};
exports.stop = function() {
  console.log(`[SOCKET-IO] Stopping socket-io service`);
  _socket.disconnect();
  if (typeof _options.onDisconnected == 'function') {
    _options.onDisconnected();
  }
};