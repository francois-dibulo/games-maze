var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        initGame();
    }
};

if (window.corodva) {
  app.initialize();
} else {
  app.onDeviceReady();
}

document.getElementById('refresh').addEventListener('touchstart', function() {
  location.reload();
});
