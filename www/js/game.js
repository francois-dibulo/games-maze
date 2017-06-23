var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var game = null;
var cursors = null;
var flash = null;

var camera_point = null;
var camera_speed = 10;
var camera_tween = null;

var map = null;

var floor_group = null;
var exit_group = null;
var start_group = null;
var wall_group = null;

var current_level_index = 0;

var input_locked = false;
var is_touch_down = false;
var last_tile = null;

var grid = [];

var Tile = {
  Wall: 0,
  Floor: 1,
  Start: 2,
  Exit: 3
};

var cursors = null;
var player_tile = null;
var Direction = {
  Up: 'up',
  Right: 'right',
  Down: 'down',
  Left: 'left'
};
var move_direction = null;
var target_tile = null;
var lock_swipe = false;
var Config = {
  Tile_Size: 0,
  Rows: 29,
  Cols: 19
};

var TILE_SIZE = 50;

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
  // var levels = [
  //   [
  //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  //     [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  //     [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  //     [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
  //     [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
  //     [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
  //     [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 3, 0],
  //     [0, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  //   ],
  //   [
  //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //     [0, 2, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  //     [0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0],
  //     [0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  //     [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  //     [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
  //     [0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0],
  //     [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 3, 0],
  //     [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
  //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  //   ]
  // ];

  function setCustomData(tile, tile_size) {
    var col = Math.floor(tile.x / tile_size);
    var row = Math.floor(tile.y / tile_size);
    tile.custom = {
      col: col,
      row: row
    };
  }

  function isNeighbor(tile1, tile2) {
    var cells = tile1.custom;
    var other = tile2.custom;
    var col_distance = Math.abs(cells.col - other.col) <= 1;
    var row_distance = Math.abs(cells.row - other.row) <= 1;

    var in_distance_c = col_distance && cells.row === other.row;
    var in_distance_r = row_distance && cells.col === other.col;

    return in_distance_r || in_distance_c;
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

    //console.log(grid);

    var safe_tile = maze.mazeEnd;
    var tile = new SafeTile(game, safe_tile.x * tile_size, safe_tile.y * tile_size, 'end', 0);
    tile.width = tile_size;
    tile.height = tile_size;
    setCustomData(tile, tile_size);
    exit_group.addChild(tile);

    var start_tile = maze.mazeStart;
    player_tile = new StartTile(game, start_tile.x * tile_size, start_tile.y * tile_size, 'start', 0);
    player_tile.width = tile_size;
    player_tile.height = tile_size;
    setCustomData(player_tile, tile_size);
    // game.physics.enable(player_tile, Phaser.Physics.ARCADE);
    start_group.addChild(player_tile);
    console.log(player_tile);
  }

  function createMap(level_index) {
    var level = levels[current_level_index];
    var height = level.length * TILE_SIZE;
    var width = level[0].length * TILE_SIZE;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setGameSize(Math.max(width, WIDTH), Math.max(HEIGHT, height));
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.parentIsWindow = true;
    //game.scale.forceOrientation(true, false);

    game.world.setBounds(0, 0, width, height);
    game.physics.startSystem(Phaser.Physics.ARCADE);

    createGroups(level);
    Timer.reset();
    Timer.start();
  }

  function loadNextLevel() {
    if (current_level_index < levels.length - 1) {
      current_level_index++;
      createMap(current_level_index);
    } else {
      console.warn("This was the last level");
      current_level_index = 0;
      createMap(current_level_index);
    }
  }

  function resetLevel() {
    Timer.stop();
    console.warn("DEAD");
    input_locked = true;

    floor_group.forEach(function(floor) {
      if (floor.is_selected) {
        floor.scaleDown();
      }
    });

    game.time.events.add(Phaser.Timer.SECOND * 2, function() {
      floor_group.forEach(function(floor) {
        if (floor.is_selected) {
          floor.resetScale();
        }
      });
      input_locked = false;
    }, this);
  }

  function resetGroup(group) {
    if (group) {
      group.removeAll(true, true);
    }
  }

  function createGroups(level) {
    resetGroup(floor_group);
    resetGroup(exit_group);
    resetGroup(start_group);

    floor_group = game.add.group();
    exit_group = game.add.group();
    start_group = game.add.group();

    grid = [];

    for (var r = 0; r < level.length; r++) {
      var row = level[r];
      grid.push([]);

      for (var c = 0; c < row.length; c++) {
        var col = row[c];

        var x = TILE_SIZE * c;
        var y = TILE_SIZE * r;

        var grid_tile = Tile.Wall;

        if (col === Tile.Floor) {
          var tile = new FloorTile(game, x, y, 'floor', 0);
          setCustomData(tile);
          floor_group.addChild(tile);
          grid_tile = Tile.Floor;
        }

        if (col === Tile.Exit) {
          var tile = new SafeTile(game, x, y, 'end', 0);
          setCustomData(tile);
          exit_group.addChild(tile);
          grid_tile = Tile.Exit;
        }

        if (col === Tile.Start) {
          var tile = new StartTile(game, x, y, 'start', 0);
          setCustomData(tile);
          start_group.addChild(tile);
          grid_tile = Tile.Start;
        }

        if (grid[r] === undefined) {
          grid[r] = [];
        }
        grid[r].push(grid_tile);
      }
    }

    exit_group.onChildInputOver.add(function(safe_tile, point) {
      if (!last_tile) return;
      if (isNeighbor(last_tile, safe_tile)) {
        // Win
        last_tile = null;
        console.info("WIN");
        floor_group.forEach(function(floor) {
          if (floor.is_selected) {
            floor.resetScale();
          }
        });
        loadNextLevel();
      };
    });

    start_group.onChildInputDown.add(function(start_tile, point) {
      if (!last_tile) {
        last_tile = start_tile;
        start_tile.onInputDown();
        is_touch_down = true;
      } else {
        start_tile.is_selected = false;
        last_tile = null;
        is_touch_down = false;
        resetLevel();
      }
    });

    start_group.onChildInputUp.add(function(start_tile, point) {
      is_touch_down = false;
    });

    floor_group.onChildInputDown.add(function(floor, point) {
      if (!last_tile || input_locked) return;
      if (isNeighbor(last_tile, floor)) {
        is_touch_down = true;
        // Only if neighbor form last active floor tile
        floor.onInputDown();
        last_tile = floor;
      } else {
        is_touch_down = false;
      }
    });

    floor_group.onChildInputOver.add(function(floor, point) {
      if (is_touch_down && !input_locked) {
        var in_range = false;
        if (last_tile) {
          in_range = isNeighbor(floor, last_tile);
        }
        if (in_range) {
          if (!floor.is_selected) {
            floor.onInputDown();
            last_tile = floor;
          } else if (last_tile && last_tile.renderOrderID !== floor.renderOrderID) {
            resetLevel();
          }
        } else {

        }
      }
    });

    floor_group.onChildInputUp.add(function(floor, point) {
      is_touch_down = false;
    });
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
          r--;
          break;
        }
        if (r === 0) {
          break;
        }
      }
      r++;
      console.log(r, c);
    } else if (move_direction === Direction.Down) {
      while(grid[c][r] !== Tile.Wall) {
        r++;
        if (grid[c + 1][r] === Tile.Floor || grid[c - 1][r] === Tile.Floor) {
          r++;
          break;
        }
        if (r === Config.Rows) {
          break;
        }
      }
      r--;
    } else if (move_direction === Direction.Left) {
      while(grid[c][r] !== Tile.Wall) {
        c--;
        if (grid[c][r + 1] === Tile.Floor || grid[c][r - 1] === Tile.Floor) {
          c--;
          break;
        }
        if (c === 0) break;
      }
      c++;
    } else if (move_direction === Direction.Right) {
      while(grid[c][r] !== Tile.Wall) {
        c++;
        if (grid[c][r + 1] === Tile.Floor || grid[c][r - 1] === Tile.Floor) {
          c++;
          break;
        }
        if (c === Config.Cols) break;
      }
      c--;
    }

    var target_pos = {
      x: c * Config.Tile_Size,
      y: r * Config.Tile_Size
    };
    var tween = game.add.tween(player_tile).to(target_pos, 200, Phaser.Easing.Bounce.Out, true);
    tween.onComplete.add(function() {
      setCustomData(player_tile, Config.Tile_Size);
      lock_swipe = false;
    });
  }

  function movePlayer(move_direction) {
    var target_candidate = getTargetTile(move_direction);
  }

  var swipe_area = new SwipeDigital("swipe-area", {
    onTrigger: function(direction_map) {
      if (lock_swipe) return;
      for (var direction in direction_map) {
        if (direction_map[direction] === true) {
          lock_swipe = true;
          move_direction = direction;
          console.log(move_direction);
          movePlayer(move_direction);
        }
      }
    }
  });

  //createMap(0);
  renderMaze();
}

function update() {
  var collide = game.physics.arcade.collide.bind(game.physics.arcade);
}
