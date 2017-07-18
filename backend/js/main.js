function joinGame(username) {
  if (username) {
    Client.setUsername(username);
  }
}

// Post up to cordova app
function postApp(message) {
  window.parent.postMessage(message, "*");
}

// Bind events from Cordova app
window.addEventListener('message',function(event) {
  var data = event.data;

  if (data) {
    if (data.set_username) {
      joinGame(data.username);
    }
  }

});

window.onload = function() {
  postApp({
    state: 'connected'
  });
}

Client.onUsernameSet = function() {
  postApp({
    state: 'matching'
  });
  Client.send('find_game');
};

Client.onGameStart = function(data) {
  postApp({
    state: 'ingame',
    game_data: data
  });
};
