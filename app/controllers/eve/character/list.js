angular
  .module('eve-overseer')
  .controller('CharacterListController', ['$scope', 'Character', function ($scope, Character) {
    $scope.characters = Character.query();
  }])
;
