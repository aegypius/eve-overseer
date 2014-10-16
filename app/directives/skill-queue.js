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

                    // Flatten skillqueue
                    var jobs = [];
                    skillqueue.map(function (group) {
                      group.skills.map(function (skill) {
                        skill.queued.map(function (queued) {
                          queued.name = skill.name;
                          queued.group = {
                              id: group.id,
                              name: group.name
                          };
                          jobs[parseInt(queued.position, 10)] = queued;
                        });
                      });
                    });

                    $scope.skills = jobs.map(function (job) {
                      var start   = moment.utc(job.time.start),
                          end     = moment.utc(job.time.end);

                      job.endTime = moment.utc(job.time.end).valueOf();

                      if (current < start) {
                        job.state = 'blocked';
                        job.percent = 0;
                      } else if (current > end ) {
                        job.state = 'completed';
                        job.percent = 100;
                      } else {
                        job.state = "running";
                        job.percent = Math.round((current - start) / (end - start) * 100 * 100) / 100;
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
