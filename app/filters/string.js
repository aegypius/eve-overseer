/**
 *  Use underscore.string (http://epeli.github.io/underscore.string/)
 *  as angular filter
 */
angular
  .module('eve-overseer')
    .filter('capitalize', function () {
      return function (str) {
        return _.str.capitalize(str);
      };
    })
    .filter('range', function() {
      return function(input, total) {
        total = parseInt(total);
        for (var i=0; i<total; i++)
          input.push(i);
        return input;
      };
    })
;
;