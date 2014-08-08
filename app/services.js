var services = angular
  .module('eve-overseer.services', [
    'ngResource'
  ]);

services.factory('Character', ['$resource', function ($resource) {
  return $resource('api/character/:id', {}, {
    query: {
      method: 'GET',
      isArray: true,
    }
  });
}]);
