var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        //initGame();
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

// =======================================================================================

var node_iframe = document.getElementById('backend-frame');

// Bind events from Node backend
window.addEventListener('message',function(event) {
  console.log("E", event.data);
});

function loadBackend() {
  node_iframe.src = "http://localhost:8081";
}

function postNode(message) {
  node_iframe.contentWindow.postMessage(message, "*");
}
