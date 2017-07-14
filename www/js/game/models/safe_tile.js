var SafeTile = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;
  this.inputEnabled = true;
  this.custom = {};
  game.physics.enable(this, Phaser.Physics.ARCADE);
}

SafeTile.prototype = Object.create(Phaser.Sprite.prototype);
SafeTile.prototype.constructor = SafeTile;
