angular
  .module('eve-overseer')
  .factory('Skill', ['$resource', function ($resource) {
    return $resource('/api/characters/:id/skills', {}, {
      query: {
        method: 'GET',
        isArray: true,
      }
    });
  }])
;
