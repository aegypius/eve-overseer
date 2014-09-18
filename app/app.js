var app = angular.module('eve-overseer', [
  'ngRoute',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'http-auth-interceptor',
]);

app
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/partials/characters.html',
        controller:  'CharacterListController'
      })
      .when('/login', {
        templateUrl: '/partials/user/login.html',
        controller:  'LoginCtrl',
      })
      .when('/signup', {
        templateUrl: '/partials/user/signup.html',
        controller:  'SignupCtrl',
      })
      .when('/profile', {
        templateUrl: '/partials/user/profile.html',
        controller:  'ProfileCtrl',
      })
      .when('/character/:id', {
        templateUrl: '/partials/character/overview.html',
        controller:  'CharacterOverviewController'
      })
      .otherwise({ redirectTo: '/'});

    $locationProvider.html5Mode(true);
  }])
  .run(['$rootScope', '$location', 'Auth', function ($rootScope, $location, Auth) {
    $rootScope.$watch('_user', function (user) {
      if (!user && ['/login', '/signup', '/logout'].indexOf($location.path()) === -1) {
        Auth.currentUser();
      }
    });

    $rootScope.logout = function () {
      Auth.logout(function (err) {
        if (!err) {
          $location.path('/');
        }
      });
    };

    // On catching 401 errors, redirect to the login page.
    $rootScope.$on('event:auth-loginRequired', function() {
      $location.path('/login');
      return false;
    });

  }])
;
