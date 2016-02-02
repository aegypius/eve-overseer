angular
    .module('eve-overseer')
    .directive('skillTree', function() {
        return {
            restrict: 'ACE',
            replace: true,
            scope: true,
            templateUrl: '/templates/skill-tree.html',
            controller: function($scope, Skill) {
                $scope.preference = {
                    filter: 'learned'
                };

                $scope.$watch('preference.filter', function(filter) {
                    if (undefined !== $scope.character) {
                        Skill.query({
                            id: $scope.character.id,
                            filter: filter
                        }, function(groups) {
                            $scope.groups = groups;
                        });
                    }
                });

                $scope.$watch('character', function(character) {
                    if (undefined !== character) {
                        Skill.query({
                            id: character.id,
                            filter: $scope.preference.filter
                        }, function(groups) {
                            $scope.groups = groups;
                        });
                    }
                });
            }
        };
    });
