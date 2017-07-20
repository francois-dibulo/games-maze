App.controllers.controller('MainCtrl', ['$scope', '$location', '$http', function($scope, $location, $http) {

  $scope.player = {
    id: null,
    username: null,
    online: navigator.onLine,
    level: 0
  };

  $scope.isOffline = function() {
    $scope.player.online = navigator.onLine;
    return navigator.onLine;
  };

  $scope.init = function() {
    //      $location.path('/' + path);
    //      $scope.$apply();
  };

}]);
