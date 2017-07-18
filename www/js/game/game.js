var Game = function(opts) {
  this.opts = opts;
  this.vp_width = window.innerWidth;
  this.vp_height = window.innerHeight;
  this.phaser = null;
  this.assets = [];
}

Game.prototype = {
  initGame: function() {
    this.phaser = new Phaser.Game(this.vp_width, this.vp_height, Phaser.AUTO, 'game-canvas', {
      preload: this.preload.bind(this),
      create: this.create.bind(this),
      update: this.update.bind(this)
    });
  },

  preload: function() {
    var assets = this.assets;
    for (var i = 0; i < assets.length; i++) {
      var asset = assets[i];
      this.phaser.load.image(asset, 'assets/images/' + asset +  '.png');
    }
  },

  create: function() {},
  update: function() {},
  destroy: function() {}
};
