angular
  .module('eve-overseer')
  .directive('wallet', function () {
    return {
      restrict: 'ACE',
      replace: true,
      scope: true,
      templateUrl: '/templates/wallet.html',
      controller: function ($scope, Wallet) {
        $scope.$watch('character', function (character) {
          if (undefined !== character) {
            Wallet.query({id: character.id}, function (transactions) {
              $scope.transactions = transactions;
            });
          }
        });
      }
    };
  })
;
