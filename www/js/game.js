var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var game = null;
var cursors = null;
var flash = null;

var camera_point = null;
var camera_speed = 10;
var camera_tween = null;

var floor_group = null;
var wall_layer = null;
var end_group = null;
var player_group = null;

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
  var map = game.add.tilemap('map');
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

  end_group = game.add.group();
  map.createFromObjects('end', 4, 'end', 0, true, false, end_group, SafeTile);

  player_group = game.add.group();
  map.createFromObjects('players', 3, 'player', 0, true, false, player_group, Player);

  floor_group.onChildInputDown.add(function(floor, point) {
    is_touch_down = true;
    // Only if neighbor form last active floor tile
    floor.onInputDown();
  });

  floor_group.onChildInputOver.add(function(floor, point) {
    if (is_touch_down) {
      // Only if neighbor
      floor.onInputDown();
    }
  });

  floor_group.onChildInputUp.add(function(floor, point) {
    is_touch_down = false;
  });

  floor_group.onChildInputOut.add(function(floor, point) {
    console.log(game.input);
    //is_touch_down = false;
  });

  // var camera_point_graphic = game.add.graphics(0, 0);
  // camera_point_graphic.beginFill(0x00FF00, 1);
  // camera_point_graphic.drawCircle(0, 0, 10);
  // camera_point = game.add.sprite(game.width / 2, game.height / 2, camera_point_graphic.generateTexture());
  // camera_point.anchor.set(0.5);
  // camera_point_graphic.destroy();

  // var prev_tween = null;
  // wp_group.forEach(function(waypoint) {
  //   var x = waypoint.centerX;
  //   var y = waypoint.centerY;
  //   if (!prev_tween) {
  //     prev_tween = game.add.tween(camera_point).to({ x: x, y: y }, 5000);
  //     camera_tween = prev_tween;
  //   } else {
  //     var tween = game.add.tween(camera_point).to({ x: x, y: y }, 5000);
  //     prev_tween.chain(tween);
  //     prev_tween = tween;
  //   }
  // });
  // camera_tween.start();
  // game.camera.follow(camera_point);

  // flash = new Flash(game);
  // wall_group.onChildInputDown.add(function(wall, point) {
  //   if (!wall.isTouchable()) return;
  //   flash.push(wall);
  //   if (flash.isLimit()) {
  //     flash.init();
  //   }
  // }, this);

  // enemy_group.forEach(function(enemy) {
  //   enemy.setTargetObj(camera_point);
  // });
}

function update() {
  var collide = game.physics.arcade.collide.bind(game.physics.arcade);
  collide(player_group, wall_layer);


  return;
  collide(enemy_group, enemy_group);
  collide(enemy_group, wall_group);

  if (flash.is_active) {
    var polygon = flash.intersection_polygon;

    // Collision Flash and Enemy
    if (enemy_group && polygon) {
      enemy_group.forEach(function(enemy) {
        var is_hit = polygon.contains(enemy.centerX, enemy.centerY);
        if (is_hit) {
          enemy.onHit();
        }
      });
    }

  }

}
