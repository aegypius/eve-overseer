angular
  .module('eve-overseer')

  .controller('CharacterListController', function ($scope, $stateParams, Character) {
    $scope.characters = Character.query();
  })

  .controller('CharacterOverviewController', function ($scope, $stateParams, Character) {
    Character.get({id : $stateParams.id }, function (character) {
      $scope.character = character;
    });
  })

;
