angular
    .module('eve-overseer')
    .factory('Wallet', function($resource) {
        return $resource('/api/characters/:id/accounts/:accountKey/', {
            accountKey: 1000
        }, {
            query: {
                method: 'GET',
                isArray: true,
            }
        });
    });
