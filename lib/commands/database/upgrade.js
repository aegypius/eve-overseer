var Command = require('ronin').Command;
var upgrade = require('../../workers/database/upgrade');

module.exports = Command.extend({
    desc: 'This command upgrade database',

    run: function (name) {
        upgrade();
    }
});
