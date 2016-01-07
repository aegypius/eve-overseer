'use strict';
const co = require('co');
const { Router } = require('express');
const User = require('../../models/user');
const account = new Router();

// Register a new account
// ======================
account.post('/', (req, res, next) => {
    co(function* () {
        let attrs = req.body;
        let { password } = attrs;

        let user = new User(attrs);

        if (null === password) {
            throw new Error('Password cannot be null');
        }

        user.set('password', password);

        try {
            yield user.save();

            res.status(201);
            res.end();
        } catch (e) {
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
        let user = yield User.findOne({ id: req.user.id });

        return user;
    })
    .then(user => {
        if (user === null) {
            res.status(404).send({
                error: 'User not found'
            });
        } else {
            res.send(user.profile);
        }
    })
    .catch(error => res.status(400).send(error));
});

// Update current logged user
// ==========================
account.put('/', (req, res, next) => {
    co(function* () {
        let user = yield User.findOne({ id: req.user.id });

        for (let property in req.body) {
            user.set(property, req.body[property]);
        }

        yield user.save();

        return user;
    })
    .then(user => {
        if (user === null) {
            res.status(404).send({
                error: 'User not found'
            });
        } else {
            res.status(202).end();
        }
    })
    .catch(error => res.status(400).send(error));
});

// Delete current logged user
// ==========================
account.delete('/', (req, res, next) => {
    res.status(100).send('OK');
});

module.exports = account;
