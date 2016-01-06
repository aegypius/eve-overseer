'use strict';
const co = require('co');
const server = require('../../');
const Mongorito = require('mongorito');
const SkillGroup = require('../../models/skill-group');
const { OAuthClient } = require('../../models/oauth');
const debug = require('debug')('overseer:database:upgrade');

module.exports = function() {
    return co(function* () {
        debug('Starting upgrade');

        // Connect to server
        yield server.connect();

        // Upgrade database
        yield [
            function* () {
                const { CLIENT_ID, CLIENT_SECRET } = process.env;

                if (CLIENT_ID && CLIENT_SECRET) {
                    debug(`Checking validity of OAuthClient ${CLIENT_ID}`);
                    let client = yield OAuthClient.where('clientId', CLIENT_ID).findOne();

                    if (!client) {
                        debug(`OAuthClient ${CLIENT_ID} not found, creating new...`);
                        client = new OAuthClient({
                            clientId: CLIENT_ID,
                            clientSecret: CLIENT_SECRET,
                            redirectUri: '/login'
                        });

                        yield client.save();
                        debug(`New OAuthClient ${CLIENT_ID} registered`);
                    }
                }
            },
            SkillGroup.synchronize()
        ];

        // Disconnect from server
        yield server.disconnect();

    }).then(() => debug('Upgrade completed'));
};
