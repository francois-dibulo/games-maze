var Player = function(socket) {
  this.id = socket.id;
  this.socket = socket;
  this.username = null;
  this.state = Player.State.Connected;
  this.current_room_id = null;
}

Player.State = {
  Connected: 'connected',
  Matching: 'matching',
  Ingame: 'ingame'
}

Player.prototype = {

  setState: function(state) {
    this.state = state;
  },

  joinRoom: function(room_id) {
    this.leaveRoom();
    this.current_room_id = room_id;
    this.socket.join(room_id);
  },

  leaveRoom: function() {
    if (this.current_room_id) {
      this.socket.leave(this.current_room_id);
      this.current_room_id = null;
    }
  },

  send: function(data) {
    this.socket.emit('message', data || {});
  },

  toJson: function() {
    return {
      id: this.id,
      username: this.username
    }
  }

};

if (module && module.exports) {
  module.exports = Player;
}
