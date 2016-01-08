'use strict';

const co = require('co');
const Mongorito = require('mongorito');
const crypto = require('crypto');
const Model = Mongorito.Model;
const debug = require('debug')('overseer:model:user');
const validator = require('validator');


class User extends Model
{
    defaults() {
        return {
            apikeys: [],
        };
    }

    configure() {
        this.before('save', 'validate');
    }

    generateSalt() {
        this.set('salt', crypto.randomBytes(64).toString('hex'));
    }

    set(key, value) {
        if (key === 'password') {
            value = this.setPassword(value);
        }
        return super.set(key, value);
    }

    setPassword(password) {
        this.generateSalt();

        return this.encrypt(password);
    }

    * validate(next) {

        let errors = [];

        // 1. Email is valid
        if (!validator.isEmail(this.get('email'))) {
            errors.push({
                name: 'ValidationError',
                property: 'email',
                email: `"${this.get('email')}" is not a valid email`
            });
        }

        // 2. Normalize Email
        this.set('email', validator.normalizeEmail(this.get('email')));

        // 2. Email must be unique
        let users = yield User.find({ email: this.get('email') });
        let results = users.filter((user) => {
            return String(user.get('_id')) !== String(this.get('_id'));
        });

        if (results.length > 0) {
            errors.push({
                name: 'ValidationError',
                property: 'email',
                message: 'An account already exist for this email'
            });
        }

        // 3. Password cannot be blank
        if (this.get('password').lenght === 0) {
            errors.push({
                name: 'ValidationError',
                property: 'password',
                message: 'Password must not be blank'
            });
        }

        if (errors.length > 0) {
            throw errors;
        }

        yield next;
    }

    getGravatar(size, alt) {
        size = parseInt(size, 10) || 200;
        alt  = alt || 'identicon';
        let email = this.get('email');

        if (!email) {
            return `https://gravatar.com/avatar/?s=${size}&d=${alt}`;
        }

        let hash = crypto.createHash('md5').update(email).digest('hex');

        return `https://gravatar.com/avatar/${hash}?s=${size}&d=${alt}`;
    }

    generateConfirmationToken(password) {
        if (!password) {
            throw new Error('Password cannot be empty');
        }

        return this.encrypt(password);
    }

    authenticate(password) {
        return (this.get('password') === this.encrypt(password));
    }

    encrypt(string) {
        if (!string) {
            throw new Error('String cannot be empty');
        }

        try {
            let hmac = crypto.createHmac('sha1', this.get('salt'));
            return hmac.update(string).digest('hex');
        } catch (error) {
            return '';
        }
    }
}

module.exports = User;
