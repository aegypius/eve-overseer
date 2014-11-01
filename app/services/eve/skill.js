angular
  .module('eve-overseer')
  .factory('Skill', ['$resource', function ($resource) {
    return $resource('/api/characters/:id/skills', {}, {
      query: {
        method: 'GET',
        isArray: true,
      },
      queued: {
        method: 'GET',
        isArray: true,
        params: {
          filter: "queued"
        }
      },
      unknown: {
        method: 'GET',
        isArray: true,
        params: {
          filter: "unknown"
        }
      },
      all: {
        method: 'GET',
        isArray: true,
        params: {
          filter: "all"
        }
      }
    });
  }])
;
