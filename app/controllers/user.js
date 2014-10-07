angular
  .module('eve-overseer')
  .controller('LoginCtrl', ['$scope', 'md5', 'AccessToken', '$location', function ($scope, md5, AccessToken, $location) {
    var gt;
    $scope.user     = {};
    $scope.errors   = {};
    $scope.gravatar = "http://www.gravatar.com/avatar/";

    $scope.$watch('user.email', function (email) {
      clearTimeout(gt);
      gt = setTimeout(function () {
        $scope.gravatar = "http://www.gravatar.com/avatar/" + md5.hash(email || '');
        $scope.$apply();
      }, 500);
    });

    $scope.login = function (form) {
      AccessToken.get({
        'email'    : $scope.user.email,
        'password' : $scope.user.password
      }, function (err) {
        $scope.errors = {};

        if (!err) {
          $location.path('/');
        } else {
          angular.forEach(err.errors, function (error, field) {
            if (form[field] !== undefined) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error;
            }
          });
          $scope.errors.other = err.message;
        }
      });
    };

  }])
  .controller('SignupCtrl', ['$scope', 'md5', 'User', '$location', function ($scope, md5, User, $location) {
    var gt;
    $scope.user     = {};
    $scope.errors   = {};
    $scope.gravatar = "http://www.gravatar.com/avatar/";

    $scope.$watch('user.email', function (email) {
      clearTimeout(gt);
      gt = setTimeout(function () {
        $scope.gravatar = "http://www.gravatar.com/avatar/" + md5.hash(email || '');
        $scope.$apply();
      }, 500);
    });

    $scope.register = function (form) {
      User.register({
          email: $scope.user.email,
          username: $scope.user.username,
          password: $scope.user.password
        },
        function(err) {
          $scope.errors = {};

          if (!err) {
            $location.path('/');
          } else {
            angular.forEach(err.errors, function(error, field) {
              if (form[field] !== undefined) {
                form[field].$setValidity('mongoose', false);
                $scope.errors[field] = error;
              }
            });
            $scope.errors.other = err.message;
          }
        }
      );
    };
  }])
  .controller('ProfileCtrl', ['$rootScope', '$scope', 'User', 'ApiKey', function ($rootScope, $scope, User, ApiKey) {
    $rootScope.$watch('_user', function (user) {
      $scope.user = user;
    });

    ApiKey.query(function (apikeys) {
      $scope.apikeys = apikeys;
    });

    $scope.addApiKey = function (form) {
      // Add a new API Key to the user
      if (form.$valid && form.$dirty) {
        apikey = new ApiKey({
          keyId: form.keyId,
          verificationCode: form.verificationCode,
        });

        // Save current user
        apikey.$save(function () {
          $scope.apikeys.push(apikey);
          $scope.apikey = {};
          form.$setPristine(true);
        });
      }
    };

    $scope.removeApiKey = function (id) {
        ApiKey.delete({ id: id }, function (user) {
          ApiKey.query(function (apikeys) {
            $scope.apikeys = apikeys;
          });
        });
    };


  }])
;
