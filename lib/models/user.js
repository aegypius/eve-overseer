'use strict';

const co = require('co');
const Mongorito = require('mongorito');
const crypto = require('crypto');
const Model = Mongorito.Model;

class User extends Model
{
    configure() {
        this.before('create', 'generateSalt');
        this.before('save', 'validate');
    }

    * generateSalt(next) {
        this.salt = '' + Math.round(new Date()).valueOf() * Math.random();

        yield next;
    }

    * validate(next) {

        // 1. Email cannot be blank
        // 2. Email must be unique
        // 3. Password cannot be blank

        yield next;
    }

    gravatar(size, alt) {
        size = parseInt(size, 10) || 200;
        alt  = alt || 'identicon';

        if (!this.email) {
            return `https://gravatar.com/avatar/?s=${size}&d=${alt}`;
        }

        let hash = crypto.createHash('md5').update(this.email).digest('hex');

        return `https://gravatar.com/avatar/${hash}?s=${size}&d=${alt}`;
    }

    generateConfirmationToken(password) {
        if (!password) {
            throw new Error('Password cannot be empty');
        }

        return this.encrypt(password);
    }

    authenticate(password) {
        return (this.password === this.encrypt(password));
    }

    encrypt(string) {
        if (!string) {
            throw new Error('String cannot be empty');
        }

        try {
            let hmac = crypto.createHmac('sha1', this.salt);
            return hmac.update(string).digest('hex');
        } catch (error) {
            return '';
        }
    }
}

module.exports = User;
