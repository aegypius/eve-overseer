angular
  .module('eve-overseer')
  .factory('SkillQueue', ['$resource', function ($resource) {
    return $resource('/api/character/:id/skills/queue', {}, {
      query: {
        method: 'GET',
        isArray: true,
      }
    });
  }])
;
