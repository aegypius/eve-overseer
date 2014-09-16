angular
  .module('eve-overseer')
  .directive('skillQueue', function () {
    return {
      restrict: 'ACE',
      replace: true,
      require: '^ngModel',
      scope: {
        ngModel : '@'
      },
      templateUrl: '/templates/skill-queue.html',
      link: function (scope, element, attrs, ctrl) {
        console.log(ctrl);
      },
      controller: ['$scope', 'SkillQueue', function ($scope, SkillQueue) {
        console.log($scope.id);
        $scope.skills = SkillQueue.query({id : $scope.id});
      }]
    };
  })
;
