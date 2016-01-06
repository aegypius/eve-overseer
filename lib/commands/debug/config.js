var Command = require('ronin').Command;
var config = require('../../config');

module.exports = Command.extend({
    desc: 'Dump configuration',
    run: function () {
        console.log('%j', config);
    }
});
