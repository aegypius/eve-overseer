const Command = require('ronin').Command;
const monq = require('monq');
const debug = require('debug')('overseer:command:start');
const config = require('../config');
const startServer = require('../').startServer;

module.exports = Command.extend({
    desc: 'start http server',
    options: {
        port: {
            alias: 'p',
            default: process.env.PORT || 3000
        }
    },
    run: function (port) {
        startServer(port).then(() => {
            const client = monq(config.database.url);
            const queue = client.queue('default');
            queue.enqueue('startup', {}, (err, job) => {
                debug(`job ${job.data._id} enqueued`);
                client.close();
            });
        });
    }
});
