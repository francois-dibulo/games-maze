var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var game = null;

var Direction = {
  Up: 'up',
  Right: 'right',
  Down: 'down',
  Left: 'left'
};

var Tile = {
  Wall: 0,
  Floor: 1,
  Start: 2,
  Exit: 3
};

var Config = {
  Tile_Size: 0,
  Rows: 19,
  Cols: 11,
  MAX_ROWS: 51
};

var grid = [];

var floor_group = null;
var exit_group = null;
var start_group = null;
var wall_group = null;

var player_tile = null;
var safe_tile = null;

var lock_swipe = false;

function initGame() {
  game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game-canvas', { preload: preload, create: create, update: update });
  Timer.init();
};

function preload() {
  game.load.image('floor', 'assets/images/floor.png');
  game.load.image('end', 'assets/images/end.png');
  game.load.image('wall', 'assets/images/wall.png');
  game.load.image('start', 'assets/images/player.png');
}

function create() {
  cursors = game.input.keyboard.createCursorKeys();

  function setCustomData(tile, tile_size) {
    var col = Math.floor(tile.x / tile_size);
    var row = Math.floor(tile.y / tile_size);
    tile.custom = {
      col: col,
      row: row
    };
  }

  function renderMaze() {
    resetGroup(floor_group);
    resetGroup(exit_group);
    resetGroup(start_group);
    resetGroup(wall_group);

    floor_group = game.add.group();
    exit_group = game.add.group();
    start_group = game.add.group();
    wall_group = game.add.group();

    var rows = Config.Rows;
    var cols = Config.Cols;
    grid = [];
    var maze = new Maze(rows, cols);
    var tile_size = Math.min(Math.floor(WIDTH / rows), Math.floor(HEIGHT / cols));
    Config.Tile_Size = tile_size;

    // SCALE
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    var width = Math.min(WIDTH, tile_size * rows);
    var height = Math.min(HEIGHT, tile_size * cols);
    game.scale.setGameSize(width, height);
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.parentIsWindow = true;

    game.world.setBounds(0, 0, width, height);
    game.physics.startSystem(Phaser.Physics.ARCADE);


    for (var x = 0; x < maze.maze.length; x++) {
      grid.push([]);
      for (var y = 0; y < maze.maze[x].length; y++) {
        var type = maze.maze[x][y].type.value;
        var pos_x = maze.maze[x][y].x * tile_size;
        var pos_y = maze.maze[x][y].y * tile_size;

        if (type === Tile.Floor) {
          var tile = new FloorTile(game, pos_x, pos_y, 'floor', 0);
          tile.width = tile_size;
          tile.height = tile_size;
          setCustomData(tile, tile_size);
          floor_group.addChild(tile);
        }

        if (type === Tile.Wall) {
          var tile = new WallTile(game, pos_x, pos_y, 'wall', 0);
          tile.width = tile_size;
          tile.height = tile_size;
          setCustomData(tile, tile_size);
          wall_group.addChild(tile);
        }

        if (grid[x] === undefined) {
          grid[x] = [];
        }
        grid[x].push(type);
      }
    }

    safe_tile = new SafeTile(game, maze.mazeEnd.x * tile_size, maze.mazeEnd.y * tile_size, 'end', 0);
    safe_tile.width = tile_size;
    safe_tile.height = tile_size;
    setCustomData(safe_tile, tile_size);
    exit_group.addChild(safe_tile);
    grid[safe_tile.custom.row][safe_tile.custom.col] = Tile.Exit;

    var start_tile = maze.mazeStart;
    player_tile = new StartTile(game, start_tile.x * tile_size, start_tile.y * tile_size, 'start', 0);
    player_tile.width = tile_size;
    player_tile.height = tile_size;
    setCustomData(player_tile, tile_size);
    start_group.addChild(player_tile);
    player_tile.body.collideWorldBounds = true;

    Timer.reset();
    Timer.start();
  }

  function loadNextLevel() {
    lock_swipe = false;
    if (Config.Rows < Config.MAX_ROWS) {
      Config.Rows += 2;
      Config.Cols += 2;
    }
    renderMaze();
  }

  function resetLevel() {
    lock_swipe = true;
    Timer.stop();
    game.time.events.add(Phaser.Timer.SECOND * 2, function() {
      loadNextLevel();
    }, this);
  }

  function resetGroup(group) {
    if (group) {
      group.removeAll(true, true);
    }
  }

  function getTargetTile(move_direction) {
    var current_col = player_tile.custom.col;
    var current_row = player_tile.custom.row;
    var c = current_col;
    var r = current_row;
    if (move_direction === Direction.Up) {
      while(grid[c][r] !== Tile.Wall) {
        r--;
        if (grid[c + 1][r] === Tile.Floor || grid[c - 1][r] === Tile.Floor) {
          break;
        }
        if (r === 0) {
          break;
        }
      }
      if (grid[c][r] === Tile.Wall) {
        r++;
      }
    } else if (move_direction === Direction.Down) {
      while(grid[c][r] !== Tile.Wall) {
        if (!grid[c]) break;
        if (r === Config.Cols - 1) {
          break;
        }
        r++;
        if (grid[c + 1][r] === Tile.Floor || grid[c - 1][r] === Tile.Floor) {
          break;
        }
      }
      if (grid[c] && grid[c][r] === Tile.Wall) {
        r--;
      }
    } else if (move_direction === Direction.Left) {
      while(grid[c][r] !== Tile.Wall) {
        c--;
        if (grid[c][r + 1] === Tile.Floor || grid[c][r - 1] === Tile.Floor) {
          break;
        }
        if (c === 0) break;
      }
      if (grid[c][r] === Tile.Wall) {
        c++;
      }
    } else if (move_direction === Direction.Right) {
      while(grid[c][r] !== Tile.Wall) {
        if (!grid[c]) break;
        if (c === Config.Rows - 1) break;
        c++;
        if (grid[c][r] === Tile.Exit) {
          break;
        }
        if (grid[c][r + 1] === Tile.Floor || grid[c][r - 1] === Tile.Floor) {
          break;
        }
      }
      if (grid[c] && grid[c][r] === Tile.Wall) {
        c--;
      }
    }

    return {
      x: c * Config.Tile_Size,
      y: r * Config.Tile_Size
    };
  }

  function movePlayer(move_direction) {
    var target_pos = getTargetTile(move_direction);
    //
    var tween = game.add.tween(player_tile).to(target_pos, 200, Phaser.Easing.Bounce.Out, true);
    tween.onComplete.add(function() {
      lock_swipe = false;
      setCustomData(player_tile, Config.Tile_Size);
      if (player_tile.custom.row === safe_tile.custom.row &&
          player_tile.custom.col === safe_tile.custom.col) {
        resetLevel();
      }
    });
  }

  var swipe_area = new SwipeDigital("swipe-area", {
    onTrigger: function(direction_map) {
      if (lock_swipe) return;
      for (var direction in direction_map) {
        if (direction_map[direction] === true) {
          lock_swipe = true;
          movePlayer(direction);
        }
      }
    }
  });

  renderMaze();
}

function update() {
}
