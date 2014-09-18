angular
  .module('eve-overseer')
  .controller('CharacterOverviewController', ['$scope', '$routeParams', 'Character', function ($scope, $routeParams, Character) {
    Character.get({id : $routeParams.id }, function (character) {
      $scope.character = character;
    });
  }])
;
