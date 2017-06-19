var FloorTile = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;

  this.inputEnabled = true;
  //this.events.onInputDown.add(this.onInputDown, this);
  //this.events.onInputOver.add(this.onInputDown, this);
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
