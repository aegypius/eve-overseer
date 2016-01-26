var Command = require('ronin').Command;
var startServer = require('../../').startServer;

module.exports = Command.extend({
    desc: 'start http server',
    options: {
        port: {
            alias: 'p',
            default: process.env.PORT || 3000
        }
    },
    run: function (port) {
        startServer(port);
    }
});
