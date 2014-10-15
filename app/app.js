var app = angular.module('eve-overseer', [
  'ngRoute',
  'ngResource',
  'ngSanitize',
  'oauth2',
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
  .run(['$rootScope', '$location', '$sessionStorage', function ($rootScope, $location, $sessionStorage) {
    $rootScope.$on('oauth2:unauthorized' , function () {
      if (['/login', '/signup'].indexOf($location.path()) === -1 ) {
        $location.path('/login');
      }
    });

    $rootScope.$storage = $sessionStorage;
  }])
;
