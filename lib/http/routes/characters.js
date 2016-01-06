'use strict';
//
// EVE API Service (http://wiki.eve-id.net/APIv2_Page_Index)
//
// Exposes EVE API to json
//
const co = require('co');
const { Router } = require('express');
const ApiKey = require('../../models/apikey');
const Character = require('../../models/character');
const characters = new Router;

// Bind characterId to the character model
characters.param('characterId', (req, res, next, id) => {

    co(function* () {
        return yield Character.populate('apikey').findOne({ id: id });
    }).then(character => {
        if (!character) {
            res.status(404);
            res.send('Character not found');
        } else {
            req.character = character;
            next();
        }
    }).catch(error => res.status(400).json(error));

});

// Get a list of characters
// ========================
characters.get('/', (req, res, next) => {
    co(function* () {
        return yield ApiKey.populate('characters').find({ _user: req.user.id });
    }).then((apikeys) => {
        let characters = [];

        for (apikey of apikeys) {
            for (character of apikey.characters) {
                characters.push({
                    id: character.id,
                    name: character.name,
                    corporation: character.corporation,
                    alliance: character.alliance,
                    faction: character.faction,
                    picture: character.picture
                });
            }
        }

        res.status(200);
        res.json(characters);

    }).catch(error => res.status(400).json(error));
});

// Get detailed informations for a character
// =========================================
characters.get('/:characterId', (req, res, next) => {
    let character = req.character;

    co(function* () {
        return yield character.refresh();
    }).then((character) => {
        res.status(200);
        res.json(character);
    }).catch((error) => {
        res.status(400);
        res.json(error);
    });
});

// Returns character skill queue
// =============================
characters.get('/:characterId/skills', (req, res, next) => {
    let filter = req.query.filter || 'learned';
    let character = req.character;

    co(function* () {
        return yield character.getSkillTree({
            filter : filter
        });
    }).then((tree) => {
        res.status(200);
        res.json(tree);
    }).catch((error) => {
        res.status(400);
        res.json(error);
    });
});

// Returns financial accounts of a character
// =========================================
characters.get('/:characterId/accounts', (req, res, next) => {
    let character = req.character;

    co(function* () {
        return yield character.getAccounts();
    }).then((accounts) => {
        res.status(200);
        res.json(accounts);
    }).catch((error) => {
        res.status(400);
        res.json(error);
    });
});

// Returns financial accounts of a character
// =========================================
characters.get('/:characterId/accounts/:accountKey', (req, res, next) => {
    let character = req.character;

    co(function* () {
        return yield character.getAccountsLogs(req.params);
    }).then((logs) => {
        res.status(200);
        res.json(logs);
    }).catch((error) => {
        res.status(400);
        res.json(error);
    });
});

module.exports = characters;
