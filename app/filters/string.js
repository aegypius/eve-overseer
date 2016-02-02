angular
    .module('eve-overseer')
    .filter('capitalize', function() {
        return function(str) {
            return str.replace(/(^|[^a-zA-Z\u00C0-\u017F'])([a-zA-Z\u00C0-\u017F])/g, function (m) {
                return m.toUpperCase();
            });
        };
    });
