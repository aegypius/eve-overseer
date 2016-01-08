'use strict';

const co = require('co');
const Mongorito = require('mongorito');
const User = require('./user');
const debug = require('debug')('overseer:oauth2');
const validator = require('validator');
const Model = Mongorito.Model;

class OAuthAccessToken extends Model
{

}

class OAuthRefreshToken extends Model
{

}

class OAuthClient extends Model
{

}


module.exports = {
    OAuthAccessToken: OAuthAccessToken,
    OAuthRefreshToken: OAuthRefreshToken,
    OAuthClient: OAuthClient,

    getClient: (clientId, clientSecret, callback) => {
        debug(`get client for ${clientId}:${clientSecret}`);

        co(function* () {
            let params = {
                clientId: clientId
            };

            if (clientSecret) {
                params = Object.assign(params, {
                    clientSecret: clientSecret
                });
            }

            let client = yield OAuthClient.findOne(params);

            return client;
        })
        .then(client => callback(null, client))
        .catch(error => callback(error));
    },

    getUserFromClient: (clientId, clientSecret, callback) => {
        debug(`request user for ${clientId}`);

        callback(null, 'anon.');
    },

    grantTypeAllowed: (clientId, grantType, callback) => {
        debug(`check that client ${clientId} is granted with ${grantType}`);

        if (grantType === 'password') {
            debug(`should explicitly check clientId with grant type: ${grantType}`);
        }

        callback(null, true);
    },

    getAccessToken: (bearerToken, callback) => {
        debug(`get access token for ${bearerToken}`);

        co(function* () {
            return yield OAuthAccessToken.findOne({
                accessToken: bearerToken
            });
        })
        .then(token => callback(null, token.toJSON()))
        .catch(error => callback(error));
    },

    saveAccessToken: (token, clientId, expires, userId, callback) => {
        debug(`save accessToken for ${userId} using ${clientId}`);

        co(function* () {
            var accessToken = new OAuthAccessToken({
                accessToken: token,
                clientId: clientId,
                userId: userId,
                expires: expires
            });

            yield accessToken.save();

            return accessToken;
        })
        .then(token => callback(null, token.toJSON()))
        .catch(error => callback(error));
    },

    getRefreshToken: (refreshToken, callback) => {
        debug(`get refresh token for ${refreshToken}`);

        co(function* () {
            let { token } = yield OAuthRefreshToken.find({
                refreshToken: refreshToken
            });

            return token;
        })
        .then(token => callback(null, token.toJSON()))
        .catch(error => callback(error));
    },

    saveRefreshToken: (token, clientId, expires, userId, callback) => {
        debug(`save refreshToken for ${userId} using ${clientId}`);

        co(function* () {
            var refreshToken = new OAuthRefreshToken({
                refreshToken: token,
                clientId: clientId,
                userId: userId,
                expires: expires
            });

            yield refreshToken.save();

            return refreshToken;
        })
        .then(token => callback(null, token.toJSON()))
        .catch(error => callback(error));
    },

    getUser: (username, password, callback) => {
        debug(`get user id for ${username} with password`);

        co(function* () {
            let email = validator.normalizeEmail(username, {
                lowercase: true,
                remove_dots: true,
                remove_extension: true
            });


            let user = yield User.findOne({
                email: email
            });

            try {
                if (!user) {
                    throw new Error(`User "${email}" does not exist`);
                }

                if (!user.authenticate(password)) {
                    throw new Error(`Credentials for "${email}" are not valid`);
                }

                callback(null, user.get('_id'));

            } catch (error) {
                debug(error.message);
                callback(error);
            }
        });
    }
};
