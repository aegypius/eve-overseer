angular
  .module('eve-overseer')
  .controller('LoginCtrl', ['$scope', 'md5', 'Auth', '$location', function ($scope, md5, Auth, $location) {
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
      Auth.login('password', {
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
  .controller('SignupCtrl', ['$scope', 'md5', 'Auth', '$location', function ($scope, md5, Auth, $location) {
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
      Auth.createUser({
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
  .controller('ProfileCtrl', ['$rootScope', '$scope', 'User', function ($rootScope, $scope, User) {
    $rootScope.$watch('_user', function (user) {
      $scope.user = user;
    });

    $scope.apikey = {};

    $scope.addApiKey = function (form) {
      // Add a new API Key to the user
      if (form.$valid && form.$dirty) {
        $scope.user.apikeys.push({
          id: form.keyId,
          verification: form.verificationCode
        });

        // Save current user
        User.update({ id: $scope.user._id, apikeys: $scope.user.apikeys })
          .$promise.then(function (user) {
            $scope.user = user;
          });
      }
    };

    $scope.removeApiKey = function (id) {
        $scope.user.apikeys = $scope.user.apikeys.filter(function (apikey) {
          return apikey._id !== id;
        });

        // Save current user
        User.update({ id: $scope.user._id, apikeys: $scope.user.apikeys })
          .$promise.then(function (user) {
            $scope.user = user;
          });
    };


  }])
;
