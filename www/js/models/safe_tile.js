var SafeTile = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;
  this.inputEnabled = true;
  this.custom = {
    col: Math.floor(x / 50),
    row: Math.floor(y / 50)
  };
  //this.events.onInputDown.add(this.onInputDown, this);
}

SafeTile.prototype = Object.create(Phaser.Sprite.prototype);
SafeTile.prototype.constructor = SafeTile;

// SafeTile.prototype.onInputDown = function (sprite, point) {
//   console.log(point);
// };
