angular
  .module('eve-overseer')
  .factory('Session', ["$resource", function ($resource) {
    return $resource('/auth/session');
  }])