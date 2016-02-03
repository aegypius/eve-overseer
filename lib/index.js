'use strict';
const debug     = require('debug')('overseer:bootstrap');
const pkg       = require('../package.json');
const env       = process.env.NODE_ENV || 'development';
const co        = require('co');


// Connect to database
const config    = require('./config');
const Mongorito = require('mongorito');

let connect = function () {
    debug(`Booting ${pkg.name} in "${env}" mode`);

    return co(function* () {
        let http = require('./http');

        debug(`Connecting to mongo : ${config.database.url}`);
        yield Mongorito.connect(config.database.url);

        return http;
    });
};

module.exports = {
    connect: connect,
    disconnect: function*() {
        yield Mongorito.disconnect();
        debug(`Disconnected from mongo`);
    },
    startServer: function (port, publicDir, callback) {
        return connect().then((http) => {
            return http.listen(port || process.env.PORT || 3333);
        })
        .then(() => {
            let log = !process.env.DEBUG ? console.log : debug;
            log(`HTTP server listening on port ${port || process.env.PORT || 3333}`);
        })
        .then(callback || function () {})
        .catch(error => console.error(error));
    }
};
