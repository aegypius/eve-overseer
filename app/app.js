var app = angular.module('eve-overseer', [
  'ngRoute',
  'ngCookies',
  'ngResource',
  'ngSanitize'
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
      .when('/character/:id', {
        templateUrl: '/partials/character/overview.html',
        controller:  'CharacterOverviewController'
      })
      .otherwise({ redirectTo: '/'});

    $locationProvider.html5Mode(true);
  }])
  .run(['$rootScope', '$location', 'Auth', function ($rootScope, $location, Auth) {
    $rootScope.$watch('user', function (user) {
      if (!user && ['/login', '/signup', '/logout'].indexOf($location.path()) === -1) {
        user = Auth.currentUser()
        undefined !== user || $location.path('/login');
      }
    });
  }])
;
