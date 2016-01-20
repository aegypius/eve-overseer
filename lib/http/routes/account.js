'use strict';
const co = require('co');
const { Router } = require('express');
const User = require('../../models/user');
const ApiKey = require('../../models/apikey');
const debug = require('debug')('overseer:test:test');
const account = new Router();

// Register a new account
// ======================
account.post('/', (req, res, next) => {
    co(function* () {
        try {
            let attrs = req.body;
            let { password } = attrs;

            let user = new User(attrs);

            if (null === password) {
                throw new Error('Password cannot be null');
            }

            user.set('password', password);

            yield user.save();

            res.status(201);
            res.end();
        } catch (e) {
            debug(e);
            res.status(400);
            if (e instanceof Array) {
                res.json(e);
            }

            res.json({
                name: e.name,
                message: e.message
            });
        }
    });
});

// Get current logged user profile
// ===============================
account.get('/', (req, res, next) => {
    co(function* () {
        try {
            let user = yield User.populate('apikeys', ApiKey).findOne({ _id: req.user.id });

            if (!user) {
                res.status(404);
                res.send({
                    error: 'User not found'
                });
            } else {
                res.status(200);
                let json = user.toJSON();

                // Remove sensitive data
                delete json._id;
                delete json.password;
                delete json.salt;

                // Add avatar
                json.avatar = user.getGravatar();

                res.json(user);
            }
        } catch (error) {
            res.status(400);
            res.send(error);
        }
    });
});

// Update current logged user
// ==========================
account.put('/', (req, res, next) => {
    co(function* () {
        try {
            let user = yield User.findOne({ _id: req.user.id });


            if (user) {
                for (let property in req.body) {
                    if (property === 'email') {
                        throw([{
                            name: 'ValidationError',
                            property: 'email',
                            message: 'Email is read-only'
                        }]);
                    }
                    user.set(property, req.body[property]);
                }

                yield user.save();

                res.status(202);
                return res.end();
            }

            res.status(404);
            res.json({
                error: 'User not found',
            });

        } catch (error) {
            res.status(400);
            res.send(error);
        }
    });
});

// Delete current logged user
// ==========================
account.delete('/', (req, res, next) => {
    res.status(100).send('OK');
});

module.exports = account;
