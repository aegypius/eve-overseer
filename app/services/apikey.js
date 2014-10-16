angular
  .module('eve-overseer')
  .factory('ApiKey', ['$rootScope', '$resource', function ($rootScope, $resource) {
    return $resource('/api/apikeys/:id', { id : '@_id' }, {
      update: {
        method: 'PUT'
      }
    });
  }])
;
