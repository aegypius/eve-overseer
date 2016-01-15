'use strict';

const Mongorito = require('mongorito');
const Model = Mongorito.Model;

class SkillGroup extends Model
{
    defaults() {
        return {
            skills: []
        };
    }
}

module.exports = SkillGroup;
