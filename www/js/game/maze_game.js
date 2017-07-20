var MazeGame = function(maze_opts) {
  this.maze_opts = maze_opts || null;
  Game.apply(this, maze_opts);

  this.grid = [];

  this.floor_group = null;
  this.exit_group = null;
  this.start_group = null;
  this.wall_group = null;

  this.player_tile = null;
  this.safe_tile = null;

  this.lock_swipe = false;

  MazeGame.Config.Rows = maze_opts ? maze_opts.rows : 19;
  MazeGame.Config.Cols = maze_opts ? maze_opts.cols : 11;
  this.assets = ['floor', 'end', 'wall', 'player'];
  this.initGame();
}

MazeGame.prototype = new Game();
MazeGame.constructor = MazeGame;

MazeGame.Direction = {
  Up: 'up',
  Right: 'right',
  Down: 'down',
  Left: 'left'
};

MazeGame.Tile = {
  Wall: 0,
  Floor: 1,
  Start: 2,
  Exit: 3
};

MazeGame.Config = {
  Tile_Size: 0,
  Rows: 19,
  Cols: 11,
  MAX_ROWS: 51,
  level: 1
};

MazeGame.prototype.setConfig = function(opts) {
  MazeGame.Config.Rows = opts.rows || 19;
  MazeGame.Config.Cols = opts.cols || 11;
  this.maze_opts = opts;
};

MazeGame.prototype.destroy = function() {
  MazeGame.Config = {
    Tile_Size: 0,
    Rows: 19,
    Cols: 11,
    MAX_ROWS: 51,
    level: 1
  };
  this.phaser.destroy();
  this.phaser = null;
};

MazeGame.prototype.create = function() {
  Timer.init();
  this.buildSwipeArea();
  this.onReady();
};

MazeGame.prototype.onReady = function() {
  return;
}

MazeGame.prototype.setCustomData = function(tile, tile_size) {
  var col = Math.floor(tile.x / tile_size);
  var row = Math.floor(tile.y / tile_size);
  tile.custom = {
    col: col,
    row: row
  };
};

MazeGame.prototype.renderMaze = function() {
  var game = this.phaser;
  console.log("render maze", game, this.phaser)
  var rows = MazeGame.Config.Rows;
  var cols = MazeGame.Config.Cols;
  this.grid = [];
  this.resetGroup(this.floor_group);
  this.resetGroup(this.exit_group);
  this.resetGroup(this.start_group);
  this.resetGroup(this.wall_group);

  this.floor_group = game.add.group();
  this.exit_group = game.add.group();
  this.start_group = game.add.group();
  this.wall_group = game.add.group();

  var maze = this.maze_opts || new Maze(rows, cols);
  var tile_size = Math.min(Math.floor(this.vp_width / rows), Math.floor(this.vp_height / cols));
  MazeGame.Config.Tile_Size = tile_size;

  // SCALE
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  var width = Math.min(this.vp_width, tile_size * rows);
  var height = Math.min(this.vp_height, tile_size * cols);
  game.scale.setGameSize(width, height);
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.scale.parentIsWindow = true;

  game.world.setBounds(0, 0, width, height);
  game.physics.startSystem(Phaser.Physics.ARCADE);

  for (var x = 0; x < maze.maze.length; x++) {
    this.grid.push([]);
    for (var y = 0; y < maze.maze[x].length; y++) {
      var type = maze.maze[x][y].type.value;
      var pos_x = maze.maze[x][y].x * tile_size;
      var pos_y = maze.maze[x][y].y * tile_size;

      if (type === MazeGame.Tile.Floor) {
        var tile = new FloorTile(game, pos_x, pos_y, 'floor', 0);
        tile.width = tile_size;
        tile.height = tile_size;
        this.setCustomData(tile, tile_size);
        this.floor_group.addChild(tile);
      }

      if (type === MazeGame.Tile.Wall) {
        var tile = new WallTile(game, pos_x, pos_y, 'wall', 0);
        tile.width = tile_size;
        tile.height = tile_size;
        this.setCustomData(tile, tile_size);
        this.wall_group.addChild(tile);
      }

      if (this.grid[x] === undefined) {
        this.grid[x] = [];
      }
      this.grid[x].push(type);
    }
  }

  this.safe_tile = new SafeTile(game, maze.mazeEnd.x * tile_size, maze.mazeEnd.y * tile_size, 'end', 0);
  this.safe_tile.width = tile_size;
  this.safe_tile.height = tile_size;
  this.setCustomData(this.safe_tile, tile_size);
  this.exit_group.addChild(this.safe_tile);
  this.grid[this.safe_tile.custom.row][this.safe_tile.custom.col] = MazeGame.Tile.Exit;

  var start_tile = maze.mazeStart;
  this.player_tile = new StartTile(game, start_tile.x * tile_size, start_tile.y * tile_size, 'player', 0);
  this.player_tile.width = tile_size;
  this.player_tile.height = tile_size;
  this.setCustomData(this.player_tile, tile_size);
  this.start_group.addChild(this.player_tile);
  this.player_tile.body.collideWorldBounds = true;

  Timer.reset();
  Timer.start();
};

MazeGame.prototype.loadNextLevel = function() {
  this.onLevelComplete(MazeGame.Config.level);
  this.lock_swipe = false;
  if (this.maze_opts) {
    if (MazeGame.Config.Rows < MazeGame.Config.MAX_ROWS) {
      MazeGame.Config.Rows += 2;
      MazeGame.Config.Cols += 2;
    }
    MazeGame.Config.level++;
    this.renderMaze();
  }
};

MazeGame.prototype.resetLevel = function() {
  this.lock_swipe = true;
  Timer.stop();
  this.phaser.time.events.add(Phaser.Timer.SECOND * 2, function() {
    this.loadNextLevel();
  }, this);
};

MazeGame.prototype.resetGroup = function(group) {
  if (group) {
    group.removeAll(true, true);
  }
};

MazeGame.prototype.getTargetTile = function(move_direction) {
  var current_col = this.player_tile.custom.col;
  var current_row = this.player_tile.custom.row;
  var grid = this.grid;
  var c = current_col;
  var r = current_row;
  if (move_direction === MazeGame.Direction.Up) {
    while(grid[c][r] !== MazeGame.Tile.Wall) {
      r--;
      if (grid[c + 1][r] === MazeGame.Tile.Floor || grid[c - 1][r] === MazeGame.Tile.Floor) {
        break;
      }
      if (r === 0) {
        break;
      }
    }
    if (grid[c][r] === MazeGame.Tile.Wall) {
      r++;
    }
  } else if (move_direction === MazeGame.Direction.Down) {
    while(grid[c][r] !== MazeGame.Tile.Wall) {
      if (!grid[c]) break;
      if (r === MazeGame.Config.Cols - 1) {
        break;
      }
      r++;
      if (grid[c + 1][r] === MazeGame.Tile.Floor || grid[c - 1][r] === MazeGame.Tile.Floor) {
        break;
      }
    }
    if (grid[c] && grid[c][r] === MazeGame.Tile.Wall) {
      r--;
    }
  } else if (move_direction === MazeGame.Direction.Left) {
    while(grid[c][r] !== MazeGame.Tile.Wall) {
      c--;
      if (grid[c][r + 1] === MazeGame.Tile.Floor || grid[c][r - 1] === MazeGame.Tile.Floor) {
        break;
      }
      if (c === 0) break;
    }
    if (grid[c][r] === MazeGame.Tile.Wall) {
      c++;
    }
  } else if (move_direction === MazeGame.Direction.Right) {
    while(grid[c][r] !== MazeGame.Tile.Wall) {
      if (!grid[c]) break;
      if (c === MazeGame.Config.Rows - 1) break;
      c++;
      if (grid[c][r] === MazeGame.Tile.Exit) {
        break;
      }
      if (grid[c][r + 1] === MazeGame.Tile.Floor || grid[c][r - 1] === MazeGame.Tile.Floor) {
        break;
      }
    }
    if (grid[c] && grid[c][r] === MazeGame.Tile.Wall) {
      c--;
    }
  }

  return {
    x: c * MazeGame.Config.Tile_Size,
    y: r * MazeGame.Config.Tile_Size
  };
};

MazeGame.prototype.movePlayer = function(move_direction) {
  var self = this;
  var target_pos = this.getTargetTile(move_direction);
  var player_tile = this.player_tile;
  var safe_tile = this.safe_tile;
  //
  var tween = this.phaser.add.tween(player_tile).to(target_pos, 200, Phaser.Easing.Bounce.Out, true);
  tween.onComplete.add(function() {
    self.lock_swipe = false;
    self.setCustomData(player_tile, MazeGame.Config.Tile_Size);
    if (player_tile.custom.row === safe_tile.custom.row &&
        player_tile.custom.col === safe_tile.custom.col) {
      self.resetLevel();
    }
  });
};

MazeGame.prototype.buildSwipeArea = function() {
  var self = this;
  var swipe_area = new SwipeDigital("swipe-area", {
    onTrigger: function(direction_map) {
      if (self.lock_swipe) return;
      for (var direction in direction_map) {
        if (direction_map[direction] === true) {
          self.lock_swipe = true;
          self.movePlayer(direction);
        }
      }
    }
  });
};

MazeGame.prototype.onLevelComplete = function() {
  console.warn("Calling internal onLevelComplete");
};
