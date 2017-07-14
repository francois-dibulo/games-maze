var WallTile = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;

  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.immovable = true;
}

WallTile.prototype = Object.create(Phaser.Sprite.prototype);
WallTile.prototype.constructor = WallTile;
