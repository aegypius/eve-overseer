'use strict';

const co = require('co');
const Mongorito = require('mongorito');
const debug = require('debug')('overseer:model:skill-group');
const Model = Mongorito.Model;

class SkillGroup extends Model
{
}

SkillGroup.synchronize = function* () {
    debug('calling synchronisation');
};

module.exports = SkillGroup;
