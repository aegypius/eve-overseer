'use strict';

const Interactor = require('interactor');
const Character = require('../models/character');
const debug = require('debug')('overseer:job:remove-character');

class RemoveCharacter extends Interactor
{
    * run() {
        const { apikey } = this;

        let characters = yield Character.find({ apikeys: apikey.get('_id') });

        for (let character of characters) {
            if (character.get('apikeys').length === 1) {
                yield character.remove();
            }
        }
    }
}

module.exports = RemoveCharacter;
