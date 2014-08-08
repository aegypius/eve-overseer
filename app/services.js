var services = angular
  .module('eve-overseer.services', [
    'ngResource'
  ]);

services
  .factory('Character', ['$resource', function ($resource) {
    return $resource('api/character/:id', {}, {
      query: {
        method: 'GET',
        isArray: true,
      }
    });
  }])
  .factory('SkillQueue', ['$resource', function ($resource) {
    return $resource('api/character/:id/skills/queue', {}, {
      query: {
        method: 'GET',
        isArray: true,
      }
    });
  }])
;
