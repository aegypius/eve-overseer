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
;
