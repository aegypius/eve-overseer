var Command = require('ronin').Command;
var startServer = require('../../').startServer;

module.exports = Command.extend({
    desc: 'This command starts the server',
    options: {
      port: {
        alias: 'p',
        default: process.env.PORT || 3000
      }
    },
    run: function (port, name) {
        startServer(port);
    }
});
