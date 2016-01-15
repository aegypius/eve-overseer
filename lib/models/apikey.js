'use strict';

const co = require('co');
const Mongorito = require('mongorito');
const Model = Mongorito.Model;
const { EveClient } = require('neow');
const validator = require('validator');
const debug = require('debug')('overseer:model:apikey');

const RefreshApiKey = require('../workers/RefreshApiKey');
const RemoveCharacter = require('../workers/RemoveCharacter');

class ApiKey extends Model
{
    defaults() {
        return {
            expires: null,
            characters: []
        };
    }

    configure() {
        this.before('create', 'validate');
        this.after('create', function* (next) {
            yield RefreshApiKey.run({ apikey: this });
            yield next;
        });
        this.after('remove', function* (next) {
            yield RemoveCharacter.run({ apikey: this });
            yield next;
        });
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

    getClient() {
        return new EveClient({
            keyId: this.get('keyId'),
            vCode: this.get('verificationCode')
        });
    }

}

module.exports = ApiKey;
