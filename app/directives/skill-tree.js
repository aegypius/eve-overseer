angular
  .module('eve-overseer')
  .directive('skillTree', function () {
    return {
      restrict: 'ACE',
      replace: true,
      scope: true,
      templateUrl: '/templates/skill-tree.html',
      controller: ['$scope', 'Skill', function ($scope, Skill) {
        $scope.$watch('character', function (character) {
          if (undefined !== character) {
            Skill.query({id: character.id}, function (skills) {
              $scope.skills = skills;
            });
          }
        });
      }]
    };
  })
;
