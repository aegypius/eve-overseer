angular
  .module('oauth2', [
    'ngStorage'
  ])
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
    .factory('AuthToken', function ($sessionStorage) {
      return {
        set: function (token) {
          var data = {
            token_type    : token.token_type,
            access_token  : token.access_token,
            refresh_token : token.refresh_token,
            expires       : moment().add(token.expires_in, 'seconds').valueOf()
          };
          $sessionStorage.token = data;
        },
        get: function () {
          return $sessionStorage.token;
        }
      };
    })
    .factory('User', function ($http, Client, AuthToken, $sessionStorage) {
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
              AuthToken.set(response.data);
            }).then(function() {
              $http
                .get('/api/account')
                .then(function (response) {
                  $sessionStorage.user = response.data;
                });
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
        },
        logout: function () {
          delete $sessionStorage.token;
          delete $sessionStorage.user;
        },
        get: function () {
          return $sessionStorage.user;
        },
        update: function (data) {
          return $http.put('/api/account', data);
        }
      };
    })

    .config(function ($httpProvider) {
      $httpProvider.interceptors.push('AuthorizationInterceptor');
      $httpProvider.interceptors.push('UnauthorizedInterceptor');
      $httpProvider.interceptors.push('ExpiredInterceptor');
    })

    .factory('AuthorizationInterceptor', function ($sessionStorage) {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          if ($sessionStorage.token) {
            config.headers.Authorization = 'Bearer ' + $sessionStorage.token.access_token;
          }
          return config;
        },
      };
    })

    .factory('UnauthorizedInterceptor', function ($rootScope, $q) {

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
    })

    .factory('ExpiredInterceptor', function () {
      return {};
    })

;
