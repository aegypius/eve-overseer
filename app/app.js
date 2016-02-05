var app = angular.module('eve-overseer', [
  'ui.router',
  'ngResource',
  'ngSanitize',
  'oauth2',
  'chartjs',

  'angular-multi-select'
]);

app
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/partials/home.html',
        controller:  function ($scope, Character) {
          $scope.characters = Character.query();
        }
      })
      .state('character', {
        url: '/character/:id',
        templateUrl: '/partials/character/overview.html',
        controller:  'CharacterOverviewController'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: '/partials/user/profile.html',
        controller:  'ProfileCtrl',
      })
      .state('login', {
        url: '/login',
        templateUrl: '/partials/user/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: '/partials/user/signup.html',
        controller: 'SignupCtrl'
      })
    ;
    $locationProvider.html5Mode(true);
  })
  .run(function ($rootScope, $state, $sessionStorage, User) {
    $rootScope.$on('oauth2:unauthorized' , function () {

      if (!($state.is('profile.login') || $state.is('profile.signup'))) {
        $state.transitionTo('login');
      }
    });

    $rootScope.$storage = $sessionStorage;
    $rootScope.logout = function () {
      User.logout();
      state.transitionTo('login');
    };
  })
;
