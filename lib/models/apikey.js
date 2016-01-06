'use strict';

const co = require('co');
const Mongorito = require('mongorito');
const Model = Mongorito.Model;
const { EveClient } = require('neow');

class ApiKey extends Model
{
    configure() {
        this.before('save', 'validate');
        this.after('save', 'link');
        this.before('remove', 'cleanup');
    }

    * validate(next) {

        // keyId cannot be blank

        // verificationCode cannot be blank

        // refresh data from api
        yield this.refresh();

        yield next;
    }

    * link(next) {

        // Link to user

        yield next;
    }

    * cleanup(next) {

        // Delete characters

        yield next;
    }

    * refresh() {
        let api = this.getClient();

        yield [
            api.fetch('account:APIKeyInfo').then((result) => {
                this.accessMask = result.key.accessMask;
                this.expires = result.key.expires;
                this.characters = [];
            }),
            api.fetch('account:AccountStatus').then((result) => {
                this.account = Object.assign({}, {
                    creation: result.createDate.content,
                    paidUntil: result.paidUntil.content,
                    logonCount: result.logonCount.content,
                    logonMinutes: result.logonMinutes.content
                });
            })
        ];
    }

    getClient() {
        return new EveClient({
            keyId: this.keyId,
            vCode: this.verificationCode
        });
    }

}

module.exports = ApiKey;
