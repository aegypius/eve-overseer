angular
    .module('eve-overseer')
    .factory('Character', function($resource) {
        return $resource('/api/characters/:id', {}, {
            query: {
                method: 'GET',
                isArray: true,
            }
        });
    });
