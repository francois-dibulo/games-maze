function joinGame(e) {
  var username = username_btn.value;
  if (username) {
    Client.setUsername(username);
  }
  e.preventDefault();
}

var join_btn = document.getElementById('join_btn');
var username_btn = document.getElementById('username');

window.onload = function() {
  join_btn.addEventListener('click', joinGame);
  VM.show('main');
}

Client.onUsernameSet = function() {
  VM.show('connect');
  Client.send('find_game');
};

Client.onGameStart = function(data) {
  VM.show('game');
};
