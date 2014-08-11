angular
  .module('eve-overseer')
  .controller('SkillQueueController', ['$scope', 'SkillQueue', function ($scope, SkillQueue) {
    $scope.skillQueue = SkillQueue.get({id: $scope.id }, function (skillQueue) {
    });
  }])
;
