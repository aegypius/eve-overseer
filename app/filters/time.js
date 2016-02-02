/**
 *  Renders time
 */
angular
    .module('eve-overseer')
    .filter('timestamp', function() {
        return function(str) {
            return moment(str).valueOf();
        };
    })
    .filter('utc', function() {
        return function(str) {
            return moment.utc(str).local().valueOf();
        };
    })
    .filter('countdown', function() {
        return function(str) {
            var now = moment(),
                end = moment(str);

            if (now.isAfter(end)) {
                return;
            }

            return end.from(now);
        };
    });
