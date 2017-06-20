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
var wall_layer = null;
var end_group = null;
var player_group = null;
var start_tile = null;

var is_touch_down = false;

function initGame() {
  game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game-canvas', { preload: preload, create: create, update: update });
};

function preload() {
  game.load.tilemap('map', 'assets/levels/level_0.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('wall', 'assets/images/wall.png');
  game.load.image('floor', 'assets/images/floor.png');
  game.load.image('end', 'assets/images/end.png');
  game.load.image('player', 'assets/images/player.png');
}

function create() {
  map = game.add.tilemap('map');
  var level_height = map.heightInPixels;
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.setGameSize(Math.max(map.widthInPixels, WIDTH), Math.max(HEIGHT, map.heightInPixels));
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.scale.parentIsWindow = true;
  //game.scale.forceOrientation(true, false);

  game.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  game.physics.startSystem(Phaser.Physics.ARCADE);

  map.addTilesetImage('wall');
  wall_layer = map.createLayer('walls');

  floor_group = game.add.group();
  map.createFromObjects('floor', 1, 'floor', 0, true, false, floor_group, FloorTile);

  floor_group.forEach(function(floor) {
    var col = Math.floor(floor.x / map.tileWidth);
    var row = Math.floor(floor.y / map.tileHeight);
    floor.custom = {
      col: col,
      row: row
    };
  });

  end_group = game.add.group();
  map.createFromObjects('end', 4, 'end', 0, true, false, end_group, SafeTile);

  player_group = game.add.group();
  map.createFromObjects('players', 3, 'player', 0, true, false, player_group, Player);
  start_tile = player_group.children[0];

  var last_tile = null;

  function isNeighbor(tile1, tile2) {
    var cells = tile1.custom;
    var other = tile2.custom;
    return Math.abs(cells.col - other.col) <= 1 && Math.abs(cells.row - other.row) <= 1;
  }

  end_group.onChildInputOver.add(function(safe_tile, point) {
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
    };
  });

  player_group.onChildInputDown.add(function(player_tile, point) {
    //if (!last_tile) {
      last_tile = player_tile;
      player_tile.onInputDown();
      is_touch_down = true;
    //}
  });

  player_group.onChildInputUp.add(function(player_tile, point) {
    is_touch_down = false;
  });

  floor_group.onChildInputDown.add(function(floor, point) {
    if (!last_tile) return;
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
    if (is_touch_down) {
      var in_range = false;
      if (last_tile) {
        in_range = isNeighbor(floor, last_tile);
      }
      if (in_range) {
        if (!floor.is_selected) {
          floor.onInputDown();
          last_tile = floor;
        } else if (last_tile && last_tile.renderOrderID !== floor.renderOrderID) {
          console.warn("DEAD");
          floor_group.forEach(function(floor) {
            if (floor.is_selected) {
              floor.scaleDown();
            }
          });
        }
      } else {

      }
    }
  });

  floor_group.onChildInputUp.add(function(floor, point) {
    is_touch_down = false;
  });

  floor_group.onChildInputOut.add(function(floor, point) {
    //console.log(game.input);
    //is_touch_down = false;
  });

}

function update() {
  var collide = game.physics.arcade.collide.bind(game.physics.arcade);
}
