var controllers = angular.module('eve-overseer.controllers', []);

controllers
  .controller('CharacterListController', ['$scope', 'Character', function ($scope, Character) {
    $scope.characters = Character.query();
  }])
  .controller('CharacterOverviewController', ['$scope', '$routeParams', 'Character', function ($scope, $routeParams, Character) {
    $scope.character = Character.get({id : $routeParams.id }, function (character) {
      // Converts date
      $scope.character.DoB = new Date(character.DoB);
    });
  }])
;
