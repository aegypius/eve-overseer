'use strict';

const Interactor = require('interactor');
const debug = require('debug')('overseer:job:refresh-apikey');
const Character = require('../models/character');
const RefreshCharacter = require('./RefreshCharacter');

class RefreshAccountStatus extends Interactor {
    * run() {
        let { apikey } = this;
        const api = apikey.getClient();

        debug('fetch account status');
        yield api.fetch('account:AccountStatus').then((result) => {
            let creation = new Date(result.createDate.content);
            let paidUntil = new Date(result.paidUntil.content);

            apikey.set('account', {
                creation: creation,
                paidUntil: paidUntil,
                logonCount: parseInt(result.logonCount.content, 10),
                logonMinutes: parseInt(result.logonMinutes.content, 10)
            });
        });
    }
}

class RefreshApiKeyInfo extends Interactor {
    * run () {
        try {
            let { apikey } = this;
            let api = apikey.getClient();

            debug('fetch apikey info');
            yield api.fetch('account:APIKeyInfo').then((result) => {
                let expires;
                let { key } = result;
                if (key.expires) {
                    expires = new Date(key.expires);
                }
                apikey.set('accessMask', parseInt(key.accessMask));
                apikey.set('expires', expires);
                apikey.set('characters', Object.keys(key.characters).map((characterId) => {
                    return parseInt(characterId, 10);
                }));
            });
        } catch (error) {
            debug(error);
        }
    }
}

class RefreshApiKeyCharacters extends Interactor
{
    *run () {
        let characters = [];

        try {
            let { apikey } = this;
            let api = apikey.getClient();

            for (let characterId of apikey.get('characters')) {
                let character = yield Character.findOne({ characterId: characterId });
                if (!character) {
                    character = new Character({
                        characterId: characterId
                    });
                }
                characters.push(RefreshCharacter.run({ apikey: apikey, character: character }));
            }

            yield characters;

        } catch (error) {
            debug(error);
        }
    }
}


class RefreshApiKey extends Interactor {

    * run() {
        try {
            let { apikey } = this;

            yield [
                RefreshAccountStatus.run(this),
                RefreshApiKeyInfo.run(this)
            ];

            yield apikey.save();

            yield RefreshApiKeyCharacters.run(this);
        } catch (error) {
            debug(error);
        }
    }
}

RefreshApiKey.RefreshAccountStatus = RefreshAccountStatus;
RefreshApiKey.RefreshApiKeyInfo = RefreshApiKeyInfo;
RefreshApiKey.RefreshApiKeyCharacters = RefreshApiKeyCharacters;

module.exports = RefreshApiKey;
