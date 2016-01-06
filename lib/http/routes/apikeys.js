'use strict';
const co = require('co');
const { Router } = require('express');
const ApiKey = require('../../models/apikey');
const apikeys = new Router();


// Add an new ApiKey
// =================
apikeys.post('/', (req, res, next) => {
    co(function* () {
        let apikey = new ApiKey({
            _user: req.user.id,
            keyId: req.body.keyId,
            verificationCode: req.body.verificationCode
        });

        yield apikey.save();

        return apikey;
    }).then(apikey => res.status(201).end())
    .catch(error => res.status(400).json(error));
});


// List ApiKeys
// =============
apikeys.get('/', (req, res, next) => {
    co(function* () {
        return yield ApiKey.find({ _user: req.user.id });
    })
    .then((apikeys) => {
        res.status(200);
        res.send(apikeys.map((apikey) =>  {
            return {
                keyId: apikey.keyId,
                verificationCode: apikey.verificationCode,
                expires: apikey.expires,
                accessMask: apikey.accessMask,
                characters: apikey.characters.length
            };
        }));
    })
    .catch(error => res.status(400).send(err));
});

// Get ApiKey details
// ==================
apikeys.get('/:apikey_id', (req, res, next) => {

    co(function* () {
        return yield ApiKey.findOne({
            _user: req.user.id,
            keyId: req.params.apikey_id
        });
    })
    .then((apikey) => {
        if (!apikey) {
            res.status(404);
            res.end();
        } else {
            res.status(200);
            res.send({
                keyId: apikey.keyId,
                verificationCode: apikey.verificationCode,
                expires: apikey.expires,
                accessMask: apikey.accessMask,
                characters: apikey.characters,
                account: apikey.account
            });
        }
    })
    .catch(error => res.status(400).send(err));

});


// Delete an ApiKey
// ================
apikeys.delete('/:apikey_id', (req, res, next) => {
    co(function* () {
        let apikey =  ApiKey.findOne({
            _user: req.user.id,
            keyId: req.params.apikey_id
        });

        yield apikey.remove();
    })
    .then(() => res.status(200).end())
    .catch((error) => res.status(400).end(error));
});

module.exports = apikeys;
