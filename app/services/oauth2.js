angular
  .module('oauth2', [])

    .factory('User', ['$http', function ($http) {
      return {
        login: function(username, password) {
          return $http
            .post('/oauth/token', $.param({
              grant_type:    'password',
              username:      username,
              password:      password,
              client_id:     'azerty',
              client_secret: 'azerty'
            }), {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then(function (err, response) {
              console.log(err, response);
            });
        }
      };
    }])

    .config(['$httpProvider', function ($httpProvider) {
      $httpProvider.interceptors.push('AuthorizationInterceptor');
      $httpProvider.interceptors.push('UnauthorizedInterceptor');
      $httpProvider.interceptors.push('ExpiredInterceptor');
    }])

    .factory('AuthorizationInterceptor', function () {
      return {
        request: function (config) {
          config.headers = config.headers || {};

          return config;
        },
      };
    })

    .factory('UnauthorizedInterceptor', ['$rootScope', '$q', function ($rootScope, $q) {

      return {
        responseError: function (rejection) {
          switch (rejection.status) {
            case 401:
              $rootScope.$broadcast('oauth2:unauthorized', rejection);
              break;
            case 403:
              $rootScope.$broadcast('oauth2:forbidden', rejection);
              break;
          }

          // otherwise, default behaviour
          return $q.reject(rejection);
        }
      };
    }])

    .factory('ExpiredInterceptor', function () {
      return {};
    })

;
