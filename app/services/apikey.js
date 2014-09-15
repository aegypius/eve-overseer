angular
  .module('eve-overseer')
  .factory('ApiKey', ['$rootScope', '$resource', function ($rootScope, $resource) {
    return $resource('/api/users/:user_id/apikey/:id', {user_id: $rootScope._user._id, id : '@_id'}, {
      update: {
        method: 'PUT'
      }
    });
  }])
;
