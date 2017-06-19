var Wall = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;

  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.immovable = true;
}

Wall.prototype = Object.create(Phaser.Sprite.prototype);
Wall.prototype.constructor = Wall;
