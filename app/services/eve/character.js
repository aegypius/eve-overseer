angular
  .module('eve-overseer')
  .factory('Character', ['$resource', function ($resource) {
    return $resource('api/character/:id', {}, {
      query: {
        method: 'GET',
        isArray: true,
      }
    });
  }])
;
