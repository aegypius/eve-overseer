'use strict';

const co = require('co');
const Mongorito = require('mongorito');
const Model = Mongorito.Model;
const { EveClient } = require('neow');
const validator = require('validator');
const Character = require('./character');
const debug = require('debug')('overseer:model:apikey');


class ApiKey extends Model
{
    defaults() {
        return {
            characters: [],
            expires: null,
        };
    }
    configure() {
        this.before('save', 'validate');
        this.before('save', 'refresh');
        this.around('save', 'getCharacters');
        this.after('remove', 'cleanup');
    }

    * validate(next) {
        let errors = [];

        // keyId cannot be blank
        if (this.get('keyId').length === 0) {
            errors.push({
                name: 'ValidationError',
                property: 'keyId',
                message: 'keyId must not be blank'
            });
        }

        // verificationCode cannot be blank
        if (this.get('verificationCode').length === 0) {
            errors.push({
                name: 'ValidationError',
                property: 'verificationCode',
                message: 'verificationCode must not be blank'
            });
        }

        // 2. ApiKey must be unique
        let apikeys = yield ApiKey.find({
            keyId: this.get('keyId'),
            verificationCode: this.get('verificationCode')
        });

        let results = apikeys.filter((item) => {
            return String(item.get('_id')) !== String(this.get('_id'));
        });

        if (results.length > 0) {
            errors.push({
                name: 'ValidationError',
                message: 'This ApiKey is already registered'
            });
        }

        if (errors.length > 0) {
            throw errors;
        }

        yield next;
    }

    * cleanup(next) {
        try {
            // Delete characters
            let characters = yield Character.find({ apikey: this.get('_id') });

            yield characters.map((character) => {
                return character.remove();
            });

        } catch (error) {
            debug(error);
        }

        yield next;
    }

    * refresh(next) {
        let api = this.getClient();

        yield api.fetch('account:AccountStatus').then((result) => {
            let creation = new Date(result.createDate.content);
            let paidUntil = new Date(result.paidUntil.content);

            this.set('account', {
                creation: creation,
                paidUntil: paidUntil,
                logonCount: parseInt(result.logonCount.content, 10),
                logonMinutes: parseInt(result.logonMinutes.content, 10)
            });
        });

        yield next;
    }

    * getCharacters(next) {
        let api = this.getClient();
        let characters = [];

        yield api.fetch('account:APIKeyInfo').then((result) => {
            let expires;
            let { key } = result;
            if (key.expires) {
                expires = new Date(key.expires);
            }
            this.set('accessMask', parseInt(key.accessMask));
            this.set('expires', expires);

            for (let id in key.characters) {
                let char = key.characters[id];
                let character = {
                    eveId: parseInt(char.characterID, 10),
                    name: char.characterName,
                };

                if (parseInt(char.corporationID) > 0) {
                    character.corporation = {
                        eveId: parseInt(char.corporationID),
                        name: char.corporationName
                    };
                }

                if (parseInt(char.allianceID) > 0) {
                    character.alliance = {
                        eveId: parseInt(char.allianceID),
                        name: char.allianceName
                    };
                }

                if (parseInt(char.factionID) > 0) {
                    character.faction = {
                        eveId: parseInt(char.factionID),
                        name: char.factionName
                    };
                }

                characters.push(character);
            }

        });

        let self = this;

        this.set('characters', yield characters.map(function * (item) {
            let character = yield Character.findOne({ eveId: item.eveId });

            if (!(character instanceof Character)) {
                character = new Character(item);
            }

            for (let property in item) {
                character.set(property, item[property]);
            }

            if (self.get('_id')) {
                character.set('apikey', self.get('_id'));
            }

            yield character.save();

            return character.get('_id');
        }));

        yield next;
    }

    getClient() {
        return new EveClient({
            keyId: this.get('keyId'),
            vCode: this.get('verificationCode')
        });
    }

}

module.exports = ApiKey;
