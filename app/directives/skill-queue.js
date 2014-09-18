angular
  .module('eve-overseer')
  .directive('skillQueue', function () {
    return {
      restrict: 'ACE',
      replace: true,
      scope: true,
      require: 'timer',
      templateUrl: '/templates/skill-queue.html',
      controller: ['$scope', 'SkillQueue', function ($scope, SkillQueue) {
        $scope.$watch('character', function (character) {
          if (undefined !== character) {
            SkillQueue.query({id: character.id}, function (skillqueue) {
              var timer = function () {
                    var current = moment();
                    $scope.skills = skillqueue.map(function (job) {
                      var start   = moment.utc(job.timeRange.start),
                          end     = moment.utc(job.timeRange.end);

                      job.endTime = moment.utc(job.timeRange.end).valueOf();

                      if (current < start) {
                        job.state = 'blocked';
                        job.percent = 0;
                      } else if (current > end ) {
                        job.state = 'completed';
                        job.percent = 100;
                      } else {
                        job.state = "running";
                        job.percent = Math.round((current - start) / (end - start) * 100 *100) / 100;
                      }
                      return job;
                    });
                  }
              ;

              timer();
              setInterval(function () {
                timer();
                $scope.$apply();
              }, 1000);

            });
          }
        });
      }]
    };
  })
;
