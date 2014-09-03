angular
  .module('eve-overseer')
  .factory('User', ['$resource', function ($resource) {
    return $resource('/users/:id', {}, {
      update: {
        method: 'PUT'
      }
    });
  }])
;
