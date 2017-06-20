var Player = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;
  this.is_selected = false;
  this.inputEnabled = true;
  this.custom = {};
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.onInputDown = function (sprite, point) {
  this.is_selected = true;
};
