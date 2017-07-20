var Client = {};
Client.socket = io.connect();
Client.username = null;

Client.send = function(key, data) {
  Client.socket.emit(key, data);
};

Client.onMessage = function(data) {
  console.log("Client.onMessage", data);
  if (data.set_username) {
    Client.username = data.set_username;
    this.onUsernameSet(data);
  }

  if (data.view === 'game') {
    this.onGameStart(data);
  }

  if (data.action === 'update') {
    this.onUpdate(data);
  }
};

Client.setUsername = function(username) {
  this.send('on_set_username', { username: username });
};

// Abstract functions
Client.onUsernameSet = function() {
  throw "Implement me";
};

Client.onUpdate = function() {
  throw "Implement me";
};

Client.onGameStart = function() {
  throw "Implement me";
};

Client.socket.on('message', Client.onMessage.bind(Client));
