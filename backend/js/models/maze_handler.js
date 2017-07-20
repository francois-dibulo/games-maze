var MazeHandler = function() {
  this.mazes = [];
}

MazeHandler.prototype = {

  create: function(amount, rows, cols) {
    this.mazes = [];
    amount = amount || 5;
    rows = rows || 19;
    cols = cols || 11;

    for (var i = 0; i < amount; i++) {
      var maze = new Maze(rows, cols);
      maze.custom = {
        rows: rows,
        cols: cols
      };
      this.mazes.push(maze);
      rows += 2;
      cols += 2;
    }
  },

  getMaze: function(index) {
    var maze = this.mazes[index];
    if (maze) {
      return {
        rows: maze.custom.rows,
        cols: maze.custom.cols,
        maze: maze.maze,
        mazeEnd: maze.mazeEnd,
        mazeStart: maze.mazeStart,
      };
    } else {
      return null
    }
  }

};

if (module && module.exports) {
  module.exports = MazeHandler;
}
