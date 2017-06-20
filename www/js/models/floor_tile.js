var FloorTile = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;
  this.custom = {};
  this.inputEnabled = true;
  //this.events.onInputDown.add(this.onInputDown, this);
  //this.events.onInputOver.add(this.onInputDown, this);
  this.pivot.x = this.width / 2;
  this.pivot.y = this.height / 2;
  this.x += this.width / 2;
  this.y += this.height / 2;
  //this.anchor.setTo(0.5, 0.5);
  this.is_selected = false;

}

FloorTile.prototype = Object.create(Phaser.Sprite.prototype);
FloorTile.prototype.constructor = FloorTile;

FloorTile.prototype.isTouchable = function (sprite, point) {
  return this.health > 1;
};

FloorTile.prototype.setActiveStyle = function (state) {
  this.alpha = state ? 0.8 : 1;
  this.is_selected = state;
};

FloorTile.prototype.onInputDown = function (sprite, point) {
  if (!this.is_selected) {
    this.setActiveStyle(true);
  }
};

FloorTile.prototype.scaleDown = function () {
  this.game.add.tween(this.scale).to( { x: 0, y: 0 }, 800, Phaser.Easing.Linear.None, true);
  this.game.time.events.add(Phaser.Timer.SECOND * 2, this.resetScale, this);
};

FloorTile.prototype.resetScale = function () {
  this.scale.setTo(1, 1);
  this.setActiveStyle(false);
};
