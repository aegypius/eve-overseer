var directives = angular.module('eve-overseer.directives', []);

directives
  .directive('skill', function() {
    return {
      controller: function ($scope) {}
    };
  })
  .directive('skillProgress', function () {
    return {
      restrict: 'AE',
      replace: true,
      require: [
        '^skill'
      ],
      templateUrl: 'templates/skill-queue.html',
      link: function (scope, elem, attrs) {
        scope.$watch('startTime + dateTime', function() {
          console.log(scope.skill);
          var start   = new Date(Date.parse(scope.skill.startTime)),
              end     = new Date(Date.parse(scope.skill.endTime))
          ;

          setInterval(function () {
            var current = new Date();
              if (start < current) {
                scope.status = 'running';
                scope.percent = Math.round((current - start) / (end - start) * 100 * 100) / 100;
              } else {
                scope.status  = 'blocked';
                scope.percent = 0;
              }
              console.log('tick');
              scope.$apply();
          }, 1000);

        });
      }
    };
  })
;
