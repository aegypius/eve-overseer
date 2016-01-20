'use strict';
var Command = require('ronin').Command;
const co     = require('co');
const server = require('../../');
const debug  = require('debug')('overseer:command:migrate');
const DatabaseMigrate = require('../../workers/DatabaseMigrate');

module.exports = Command.extend({
    desc: 'Run database migrations',

    run: function () {
        co(function* () {
            yield DatabaseMigrate.run();
        });
    }

});
