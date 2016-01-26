const co = require('co');
const monq = require('monq');
const config = require('../config');
const server = require('../');
const Command = require('ronin').Command;

module.exports = Command.extend({
    desc: 'start a worker',
    options: {
        queue: {
            type: 'string',
            default: 'default'
        }
    },
    run: (queue, name) => {
        const debug = require('debug')(`overseer:worker:${queue}`);
        debug(`worker is running in ${process.env.NODE_ENV} mode`);
        co(function* () {
            try {
                yield server.connect();

                const client = monq(config.database.url);
                const worker = client.worker(queue);
                worker.register(require('../workers'));
                worker.start();

                worker.on('dequeued', (job) => console.log(`start processing job "${job.name}" ${job._id}`));
                worker.on('complete', (job) => console.log(`finish processing job "${job.name}" ${job._id}`));
                worker.on('failed',   (job) => console.error(`failed processing job "${job.name}" ${job._id}`));
                worker.on('error',    (err) => console.error(err));

            } catch (e) {
                debug(e);
            }
        });
    }
});
