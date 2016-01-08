'use strict';

const co = require('co');
const Mongorito = require('mongorito');
const Model = Mongorito.Model;

class Character extends Model
{
    defaults() {
        return {
            corporation: [],
            alliance: [],
            faction: []
        };
    }
}

module.exports = Character;
