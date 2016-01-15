'use strict';
var Command = require('ronin').Command;
// var upgrade = require('../../workers/database/upgrade');
const co     = require('co');
const server = require('../../');
const debug  = require('debug')('overseer:command:upgrade');
const UpdateSkillTree = require('../../workers/UpdateSkillTree');

module.exports = Command.extend({
    desc: 'This command upgrade database',

    run: function () {
        co(function* () {
            debug('starting database upgrade');
            yield server.connect();

            let job = new UpdateSkillTree();
            yield job.run();

            yield server.disconnect();
            debug('finished database upgrade');
        });
    }

});
