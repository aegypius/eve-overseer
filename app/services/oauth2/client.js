angular
  .module('oauth2-client', [])


  .factory('AccessToken', ['$http', function($http) {
    return {
      get: function (credentials) {
        console.log(credentials);
      },
    };
  }])


  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push(['$rootScope', '$q', function ($rootScope, $q) {
      return {
        responseError: function (rejection) {
          switch (rejection.status) {
            case 400:
              if (rejection.data.error !== undefined) {
                switch (rejection.data.error) {
                  case 'invalid_request':
                    $rootScope.$broadcast('event:oauth2-invalid-request', rejection);
                    return;
                  case 'invalid_grant':
                    $rootScope.$broadcast('event:oauth2-invalid-grant', rejection);
                    return;
                }
              }
              break;
            case 401:
              $rootScope.$broadcast('event:oauth2-invalid-token', rejection);
              break;
            case 403:
              $rootScope.$broadcast('event:oauth2-unauthorized', rejection);
              break;
          }

          // otherwise, default behaviour
          return $q.reject(rejection);
        }
      };
    }]);
  }])
;
