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

var TILE_SIZE = 50;

function initGame() {
  game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game-canvas', { preload: preload, create: create, update: update });
};

function preload() {
  game.load.image('floor', 'assets/images/floor.png');
  game.load.image('end', 'assets/images/end.png');
  game.load.image('start', 'assets/images/player.png');
}

function create() {

  var levels = [
    [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0],
      [0, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
      [0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 3, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
  ];

  function setCustomData(tile) {
    var col = Math.floor(tile.x / TILE_SIZE);
    var row = Math.floor(tile.y / TILE_SIZE);
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

  createMap(0);
}

function update() {
  var collide = game.physics.arcade.collide.bind(game.physics.arcade);
}
