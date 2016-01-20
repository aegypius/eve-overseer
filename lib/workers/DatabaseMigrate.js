'use strict';

const Interactor = require('interactor');
const debug = require('debug')('overseer:job:database-migate');
const { OAuthClient } = require('../models/oauth');
const server = require('../');
const UpdateSkillTree = require('./UpdateSkillTree');

class DatabaseMigrateOAuthClients extends Interactor
{
    * run() {
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
            }
        }
    }
}


class DatabaseMigrate extends Interactor
{
    * run() {
        yield server.connect();

        yield [
            DatabaseMigrateOAuthClients.run(this),
            UpdateSkillTree.run(this),
        ];

        // Disconnect from server
        yield server.disconnect();
    }
}

DatabaseMigrate.DatabaseMigrateOAuthClients = DatabaseMigrateOAuthClients;

module.exports = DatabaseMigrate;
