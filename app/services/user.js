angular
  .module('eve-overseer')
  .factory('User', ['$resource', function ($resource) {
    return $resource('/auth/users/:id', {}, {
      update: {
        method: 'PUT'
      }
    });
  }])
;
