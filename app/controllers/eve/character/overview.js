angular
  .module('eve-overseer')
  .controller('CharacterOverviewController', ['$scope', '$routeParams', 'Character', function ($scope, $routeParams, Character) {
    $scope.character = Character.get({id : $routeParams.id });
  }])
;
