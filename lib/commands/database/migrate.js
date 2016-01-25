'use strict';

const Command = require('ronin').Command;
const co      = require('co');
const monq    = require('monq');
const debug   = require('debug')('overseer:command:migrate');
const config  = require('../../config');

module.exports = Command.extend({
    desc: 'Run database migrations',
    run: function (name) {
        const client = monq(config.database.url);
        const queue = client.queue('default');
        queue.enqueue('migrate', {}, (err, job) => {
            debug(`job ${job.data._id} enqueued`);
            client.close();
        });
    }
});
