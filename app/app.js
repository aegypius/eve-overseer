var app = angular.module('eve-overseer', [
  'ngRoute',
  'eve-overseer.filters',
  'eve-overseer.controllers',
  'eve-overseer.services'
]);

app
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/characters.html',
        controller:  'CharacterListController'
      })
      .when('/character/:id', {
        templateUrl: 'partials/character/overview.html',
        controller:  'CharacterOverviewController'
      })
      .otherwise({ redirectTo: '/'});
  }])
  .run()
;
