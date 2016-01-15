'use strict';

const Interactor = require('interactor');
const debug = require('debug')('overseer:job:update-skill-tree');
const { EveClient } = require('neow');
const Skill = require('../models/skill');
const SkillGroup = require('../models/skill-group');

class UpdateSkillTree extends Interactor {

    * run() {
        try {
            const api = new EveClient();
            let { skillGroups } = yield api.fetch('eve:SkillTree');

            for (let groupId in skillGroups) {
                let skillGroup = skillGroups[groupId];
                let group = yield SkillGroup.findOne({ groupId: parseInt(groupId, 10) });
                if (!group) {
                    group = new SkillGroup({ groupId: parseInt(groupId, 10) });
                }
                group.set('name', skillGroup.groupName);

                yield group.save();

                let skills = [];
                for (let skillId in skillGroup.skills) {
                    let skillItem = skillGroup.skills[skillId];
                    let skill = yield Skill.findOne({ skillId: parseInt(skillId, 10) });
                    if (!skill) {
                        skill = new Skill({ skillId: parseInt(skillId, 10) });
                    }
                    skill.set('name', skillItem.typeName);
                    skill.set('description', skillItem.description.content);
                    skill.set('rank', parseInt(skillItem.rank.content));
                    skill.set('published', skillItem.published === '1');
                    skill.set('group', group.get('_id'));

                    let attributes = [];
                    for (let rank in skillItem.requiredAttributes) {
                        attributes.push(skillItem.requiredAttributes[rank].content);
                    }
                    skill.set('attributes', attributes);

                    let bonuses = [];
                    for (let id in skillItem.skillBonusCollection) {
                        let bonus = skillItem.skillBonusCollection[id];
                        bonuses.push({
                            type: bonus.bonusType,
                            value: bonus.bonusValue
                        });
                    }
                    skill.set('bonuses', bonuses);

                    let requirements = [];
                    for (let id in skillItem.requiredSkills) {
                        let item = skillItem.requiredSkills[id];

                        let requiredSkill = yield Skill.findOne({ skillId: parseInt(item.typeID, 10) });
                        if (!requiredSkill) {
                            requiredSkill = new Skill({
                                skillId: parseInt(item.typeID, 10)
                            });
                            yield requiredSkill.save();
                        }

                        let requirement = {
                            skill: requiredSkill.get('_id'),
                            level: parseInt(item.skillLevel, 10)
                        };

                        requirements.push(requirement);
                    }
                    skill.set('requirements', requirements);

                    yield skill.save();

                    skills.push(skill.get('_id'));
                }
                group.set('skills', skills);

                yield group.save();
            }

        } catch (error) {
            debug(error);
        }
    }

}

module.exports = UpdateSkillTree;
