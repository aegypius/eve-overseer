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
            faction: [],
            skills: []
        };
    }

    set(key, value) {
        super.set(key, value);
        if (key === 'eveId') {
            this.set('picture', {
                poster:  `http://image.eveonline.com/Character/${value}_1024.jpg`,
                xlarge:  `http://image.eveonline.com/Character/${value}_512.jpg`,
                large:   `http://image.eveonline.com/Character/${value}_256.jpg`,
                medium:  `http://image.eveonline.com/Character/${value}_128.jpg`,
                small:   `http://image.eveonline.com/Character/${value}_64.jpg`
            });
        }
    }
}

module.exports = Character;
