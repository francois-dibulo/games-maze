App.controllers.controller('MainCtrl', ['$scope', '$location', '$http', function($scope, $location, $http) {

  $scope.player = {
    id: null,
    username: null
  };

  $scope.init = function() {
    //      $location.path('/' + path);
    //      $scope.$apply();
  };

}]);
