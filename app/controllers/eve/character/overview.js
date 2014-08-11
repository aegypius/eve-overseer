angular
  .module('eve-overseer')
  .controller('CharacterOverviewController', ['$scope', '$routeParams', 'Character', function ($scope, $routeParams, Character) {
    $scope.id = $routeParams.id;
    $scope.character = Character.get({id : $routeParams.id }, function (character) {
      // Converts date
      $scope.character.DoB = new Date(character.DoB);
    });
  }])
;
