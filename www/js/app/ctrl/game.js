App.controllers.controller('GameCtrl', ['$scope', '$location', '$http', '$window', '$routeParams', function($scope, $location, $http, $window, $routeParams) {

  var REMOTE_BASE_URL = "http://localhost:8081";
  var node_iframe = null;

  $scope.ingame = false;
  $scope.remote = false;

  var State = {
    Connected: 'connected',
    Matching: 'matching',
    Ingame: 'ingame'
  };

  var room_id = null;
  $scope.opponents = [];

  if ($routeParams && $routeParams.type) {
    $scope.remote = $routeParams.type === "remote" ? true : false;
    $scope.remote_path = $scope.remote ? 'views/_game_remote.html' : 'views/_game_local.html';
  }

  // =====================================================================================
  // GAME
  // =====================================================================================

  var startGame = function(data) {
    $scope.ingame = true;
    var game = new MazeGame(data);
    game.onLevelComplete = function() {
      console.info("Level completed");
      if ($scope.remote) {
        postBackend({
          action: 'on_level_completed',
          user_id: $scope.player.id
        });
      }
    }
  };

  // =====================================================================================
  // BACKEND
  // =====================================================================================

  var onBackendMessage = function(event) {
    var data = event.data;
    if (data) {

      if (data.state) {
        $scope.state = data.state;
        if (!$scope.ingame && data.state === State.Ingame) {
          console.log(data);
          $scope.opponents = data.opponents;
          room_id = data.room_id;
          startGame(data.game_data.maze);
        }
      }

      $scope.$apply();
    }
  };

  var postBackend = function(message) {
    node_iframe.contentWindow.postMessage(message, "*");
  };

  var loadBackend = function() {
    node_iframe = document.getElementById('backend-frame');

    // Bind events from Node backend
    $window.addEventListener('message', onBackendMessage);

    node_iframe.onload = function() {

    }

    node_iframe.src = REMOTE_BASE_URL;
  };

  $scope.joinGame = function() {
    postBackend({
      set_username: true,
      username: $scope.player.username
    });
  };

  // =====================================================================================
  // INIT
  // =====================================================================================

  $scope.init = function() {
    //      $location.path('/' + path);
    //      $scope.$apply();
  };

  $scope.partialLoaded = function() {
    if ($scope.remote) {
      loadBackend();
    } else {
      startGame();
    }
  };

}]);
