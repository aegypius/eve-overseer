angular
  .module('oauth2', [])
    .factory('Client', function () {
      return {
        getId: function () {
          return '${ENV:CLIENT_ID}';
        },
        getSecret: function() {
          return '${ENV:CLIENT_SECRET}';
        }
      };
    })
    .factory('User', ['$http', 'Client', function ($http, Client) {
      return {
        login: function(username, password) {
          return $http
            .post('/oauth/token', $.param({
              grant_type:    'password',
              username:      username,
              password:      password,
              client_id:     Client.getId(),
              client_secret: Client.getSecret()
            }), {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then(function (response) {
              console.log(response);
            });
        },
        register: function (data) {
          return $http
            .post('/oauth/token', $.param({
              grant_type: 'client_credentials',
              client_id:     Client.getId(),
              client_secret: Client.getSecret()
            }), {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            })
            .then(function (response)  {
              return response.data;
            })
            .then(function(token) {
              return $http
                .post("/api/account", data , {
                  headers: {
                    'Authorization': 'Bearer ' + token.access_token
                  }
                });
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
