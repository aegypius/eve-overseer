angular
    .module('eve-overseer')
    .factory('ApiKey', function($rootScope, $resource) {
        return $resource('/api/apikeys/:id', {
            id: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    });
