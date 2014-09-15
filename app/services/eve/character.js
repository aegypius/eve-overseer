angular
  .module('eve-overseer')
  .factory('Character', ['$resource', function ($resource) {
    return $resource('/api/characters/:id', {}, {
      query: {
        method: 'GET',
        isArray: true,
      }
    });
  }])
;
