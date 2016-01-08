'use strict';
const co = require('co');
const { Router } = require('express');
const ApiKey = require('../../models/apikey');
const Character = require('../../models/character');
const apikeys = new Router();
const debug = require('debug')('overseer:routes:apikeys');


// Add an new ApiKey
// =================
apikeys.post('/', (req, res, next) => {
    co(function* () {
        try {
            let apikey = new ApiKey({
                user: req.user.id,
                keyId: req.body.keyId,
                verificationCode: req.body.verificationCode
            });

            yield apikey.save();

            res.status(201);
            res.end();
        } catch (error) {
            res.status(400);
            res.json(error);
        }

    });
});


// List ApiKeys
// =============
apikeys.get('/', (req, res, next) => {
    co(function* () {
        try {
            let apikeys = yield ApiKey.find({ user: req.user.id });

            res.status(200);
            res.json(apikeys.map((apikey) =>  {
                let json = apikey.toJSON();

                json.characters = apikey.get('characters').length || 0;

                return json;
            }));

        } catch (error) {
            res.status(400);
            res.json(error);
        }
    });
});

// Get ApiKey details
// ==================
apikeys.get('/:apikey_id', (req, res, next) => {

    co(function* () {
        try {
            let apikey = yield ApiKey.populate('characters', Character).findOne({
                user: req.user.id,
                keyId: req.params.apikey_id
            });

            if (!apikey) {
                res.status(404);
                res.end();
                return;
            }

            res.status(200);
            res.json(apikey);

        } catch (error) {
            res.status(400);
            res.json(error);
        }
    });

});


// Delete an ApiKey
// ================
apikeys.delete('/:apikey_id', (req, res, next) => {
    co(function* () {
        try {
            let apikey = yield ApiKey.findOne({
                user: req.user.id,
                keyId: req.params.apikey_id
            });

            yield apikey.remove();

            res.status(200);
            res.send();

        } catch(error) {
            debug(error);
            res.status(400);
            res.send(error);
        }
    });
});

module.exports = apikeys;
