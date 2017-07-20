if (require) {
  MazeHandler = require('./maze_handler');
}

var Room = function(id, io) {
  this.id = id;
  this.io = io;
  this.players = [];
  this.maze_handler = new MazeHandler();
}

Room.prototype = {

  addPlayer: function(player_id) {
    this.players.push(player_id);
  },

  removePlayer: function(player_id) {
    var index = this.players.indexOf(player_id);
    this.players.splice(index, 1);
  },

  clear: function() {
    for (var i = this.players.length - 1; i >= 0; i--) {
      this.removePlayer(this.players[i]);
    }
  },

  broadcast: function(data) {
    this.io.sockets.in(this.id).emit('message', data);
  }

};

if (module && module.exports) {
  module.exports = Room;
}
