angular.module('eve-overseer')
    .controller('CharacterOverviewController', function($scope, $stateParams, Character) {
        Character.get({
            id: $stateParams.id
        }, function(character) {
            $scope.character = character;
        });
    })
;
