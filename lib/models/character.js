'use strict';

const co = require('co');
const Mongorito = require('mongorito');
const Model = Mongorito.Model;
const Skill = require('./skill');
const SkillGroup = require('./skill-group');

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

    * getSkillTree(options) {
        let { filter } = options;
        let skills = this.get('skills');
        let ids = skills.map(s => s.skill.toString());

        // Group by SkillGroup
        let groups = yield SkillGroup.populate('skills', Skill).find();
        let tree = groups.filter((group) => {

            let skills = group.get('skills').filter((skill) => {

                if (!skill.get('published')) {
                    return false;
                }

                let learned = ids.indexOf(skill.get('_id').toString()) >= 0;
                switch (filter) {

                case 'unknown':
                    return !learned;

                case 'all':
                    return true;

                default:
                    return learned;

                }

                return true;
            });

            group.set('skills', skills);

            return skills.length > 0;
        }).map((group) => {
            let json = group.toJSON();
            json.skills = json.skills.map((skill) => {
                let json = skill.toJSON();

                // Merge meta data from character skills (level, queued, ...)
                let { level, points, queued } = skills.filter(s => {
                    return s.skill.toString() == json._id;
                }).reduce((a, b) => b, {});

                json.level = level || null;
                json.points = points || null;
                json.queued = queued || null;

                return json;
            }).filter((skill) => {
                if (filter === 'queued' && skill.queued === null) {
                    return false;
                }

                if (filter === 'unknown' && skill.level) {
                    return false;
                }

                return true;
            });
            return json;
        }).filter((group) => {
            return group.skills.length > 0;
        });

        return tree;
    }
}

module.exports = Character;
