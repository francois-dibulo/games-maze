var StartTile = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;
  this.is_selected = false;
  this.inputEnabled = true;
  this.custom = {};
  game.physics.enable(this, Phaser.Physics.ARCADE);
}

StartTile.prototype = Object.create(Phaser.Sprite.prototype);
StartTile.prototype.constructor = StartTile;

StartTile.prototype.onInputDown = function (sprite, point) {
  this.is_selected = true;
};
