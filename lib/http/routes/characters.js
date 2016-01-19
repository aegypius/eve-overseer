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
        try {
            let character =  yield Character.findOne({ characterId: parseInt(id, 10) });

            if (!character) {
                debug(`Character "${id}" not found`);
                res.status(404);
                return res.send(new Error('Character not found'));
            }

            req.character = character;

            next();
        } catch(error) {
            debug(error);
            res.status(400);
            res.json(error);
        }
    });
});

// Get a list of characters
// ========================
characters.get('/', (req, res, next) => {
    co(function* () {

        try {
            let characters = [];
            let apikeys =  yield ApiKey.find({ user: req.user.id });

            for (let apikey of apikeys) {
                characters = (yield Character.find({ characterId: { $in: apikey.get('characters') }})).map((character) => {
                    let json = character.toJSON();

                    json.id = json.characterId;

                    delete json._id;
                    delete json.characterId;

                    return json;
                });
            }

            res.status(200);
            res.json(characters);
        } catch (error) {
            debug(error);
            res.status(400);
            res.json(error);
        }

    });
});

// Get detailed informations for a character
// =========================================
characters.get('/:characterId', (req, res, next) => {
    let character = req.character.toJSON();

    co(function* () {
        try {
            character.id = character.characterId;

            delete character._id;
            delete character.characterId;

            res.status(200);
            res.json(character);
        } catch (error) {
            debug(error);
            res.status(400);
            res.json(error);
        }
    });
});

// Returns character skill queue
// =============================
characters.get('/:characterId/skills', (req, res, next) => {
    let filter = req.query.filter || 'learned';
    let character = req.character;
    co(function* () {
        try {
            let tree = yield character.getSkillTree({
                filter : filter
            });
            res.status(200);
            res.json(tree.map(group => {
                group.id = group.groupId;
                delete group._id;
                delete group.groupId;
                delete group.created_at;
                delete group.updated_at;

                group.skills = group.skills.map(skill => {
                    skill.id = skill.skillId;
                    delete skill._id;
                    delete skill.skillId;
                    delete skill.created_at;
                    delete skill.updated_at;

                    return skill;
                });

                return group;
            }));
        } catch (error) {
            debug(error);
            res.status(400);
            res.json(error);
        }
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
