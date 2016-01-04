var Command = require('ronin').Command;
var startServer = require('../../').startServer;

module.exports = Command.extend({
    desc: 'This command starts the server',

    run: function (name) {
        startServer(process.env.PORT || 3000);
    }
});
