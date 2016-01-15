'use strict';
const Interactor = require('interactor');
const Character = require('../models/character');
const Skill = require('../models/skill');
const debug = require('debug')('overseer:job:refresh-character');


class RefreshCharacterStats extends Interactor {
    *run() {
        debug('refresh stats');
        let { apikey, character } = this;
        const api = apikey.getClient();
        const characterId = character.get('characterId');

        // Prepare mapping for skills
        const skills = yield Skill.find();
        let skillMapping = {};
        for (let skill of skills) {
            skillMapping[skill.get('skillId')] = skill.get('_id');
        }

        try {
            yield api.fetch('char:CharacterSheet', { characterID: characterId }).then((result) => {
                let apikeys = character.get('apikeys') || [];

                if (apikeys.indexOf(apikey.get('_id')) === -1) {
                    apikeys.push(apikey.get('_id'));
                }

                // Character details
                character.set('name', result.name.content);
                character.set('picture', {
                    poster:  `http://image.eveonline.com/Character/${characterId}_1024.jpg`,
                    xlarge:  `http://image.eveonline.com/Character/${characterId}_512.jpg`,
                    large:   `http://image.eveonline.com/Character/${characterId}_256.jpg`,
                    medium:  `http://image.eveonline.com/Character/${characterId}_128.jpg`,
                    small:   `http://image.eveonline.com/Character/${characterId}_64.jpg`
                });
                character.set('apikeys', apikeys);
                character.set('birthdate', new Date(result.DoB.content));
                character.set('race', result.race.content);
                character.set('bloodline', result.bloodLine.content);
                character.set('ancestry', result.ancestry.content);
                character.set('balance', parseFloat(result.balance.content, 10));
                character.set('gender', result.gender.content);
                character.set('homeStation', parseInt(result.homeStationID.content, 10));
                character.set('currentTime', new Date(result.currentTime));
                character.set('cachedUntil', new Date(result.cachedUntil));

                // Corporation
                let corporation = {};
                if (result.corporationID.content && parseInt(result.corporationID.content, 10) > 0) {

                    let corporationTitles = [];
                    for (let titleId in result.corporationTitles) {
                        corporationTitles.push({
                            id: parseInt(result.corporationTitles[titleId].titleID, 10),
                            title: result.corporationTitles[titleId].titleName
                        });
                    }

                    let corporationRoles = [];
                    for (let id in result.corporationRoles) {
                        corporationRoles.push({
                            id: parseInt(result.corporationRoles[id].roleID, 10),
                            title: result.corporationRoles[id].roleName
                        });
                    }

                    let corporationRolesAtHQ = [];
                    for (let id in result.corporationRolesAtHQ) {
                        corporationRolesAtHQ.push({
                            id: parseInt(result.corporationRolesAtHQ[id].roleID, 10),
                            title: result.corporationRolesAtHQ[id].roleName
                        });
                    }

                    let corporationRolesAtBase = [];
                    for (let id in result.corporationRolesAtBase) {
                        corporationRolesAtBase.push({
                            id: parseInt(result.corporationRolesAtBase[id].roleID, 10),
                            title: result.corporationRolesAtBase[id].roleName
                        });
                    }

                    let corporationRolesAtOther = [];
                    for (let id in result.corporationRolesAtOther) {
                        corporationRolesAtOther.push({
                            id: parseInt(result.corporationRolesAtOther[id].roleID, 10),
                            title: result.corporationRolesAtOther[id].roleName
                        });
                    }

                    corporation = {
                        id: parseInt(result.corporationID.content, 10),
                        name: result.corporationName.content,
                        titles: corporationTitles,
                        roles: corporationRoles,
                        rolesAtHq: corporationRolesAtHQ,
                        rolesAtBase: corporationRolesAtBase,
                        rolesAtOther: corporationRolesAtOther,
                    };
                }
                character.set('corporation', corporation);

                // Faction
                let faction = {};
                if (result.factionID.content && parseInt(result.factionID.content, 10) > 0) {
                    faction = {
                        id: parseInt(result.factionID.content, 10),
                        name: result.factionName.content
                    };
                }
                character.set('faction', faction);

                // Alliance
                let alliance = {};
                if (result.allianceID.content && parseInt(result.allianceID.content, 10) > 0) {
                    alliance = {
                        id: parseInt(result.allianceID.content, 10),
                        name: result.allianceName.content
                    };
                }
                character.set('alliance', alliance);

                // Skillpoints available to be assigned.
                character.set('freeSkillPoints', parseInt(result.freeSkillPoints.content, 10));

                // Respec
                character.set('respec', {
                    free: parseInt(result.freeRespecs.content, 10),
                    last: new Date(result.lastRespecDate.content),
                    timed: new Date(result.lastTimedRespec.content),
                });

                // Attributes
                let attributes = {};
                for (let attribute in result.attributes) {
                    attributes[attribute] = parseInt(result.attributes[attribute].content, 10);
                }
                character.set('attributes', attributes);

                // Jump
                character.set('jump', {
                    activation: new Date(result.jumpActivation.content),
                    fatigue: new Date(result.jumpFatigue.content),
                    lastUpdate: new Date(result.jumpLastUpdate.content)
                });

                // Jump Clones
                let jumpClones = [];
                for (let id in result.jumpClones) {
                    let implants = [];
                    let jumpClonesImplants = result.jumpClonesImplants[id];

                    for (let id in jumpClonesImplants) {
                        implants.push({
                            id: parseInt(jumpClonesImplants[id].typeID, 10),
                            name: jumpClonesImplants[id].typeName
                        });
                    }

                    jumpClones.push({
                        id: parseInt(result.jumpClones[id].jumpCloneID, 10),
                        locationId: parseInt(result.jumpClones[id].locationID, 10),
                        name: result.jumpClones[id].cloneName,
                        implants: implants
                    });
                }
                character.set('jumpClones', jumpClones);

                // Implants
                let implants = [];
                for (let implant in result.implants) {
                    implants.push({
                        id: parseInt(implant, 10),
                        name: result.implants[implant].typeName
                    });
                }
                character.set('implants', implants);

                // Skills
                let skills = [];
                for (let id in result.skills) {
                    skills.push({
                        skill: skillMapping[parseInt(id, 10)],
                        points: parseInt(result.skills[id].skillpoints, 10),
                        level: parseInt(result.skills[id].level, 10),
                        published: parseInt(result.skills[id].published, 10) === 1
                    });
                }

                character.set('skills', skills);

            });
        } catch (error) {
            debug(error);
        }

        return character.save();
    }
}

class RefreshCharacterSkillTree extends Interactor {
    *run() {
        let { apikey, character } = this;
        const api = apikey.getClient();
        debug('refresh skilltree');

        // Prepare mapping for skills
        const skills = yield Skill.find();
        let skillMapping = {};
        for (let skill of skills) {
            skillMapping[skill.get('skillId')] = skill.get('_id');
        }

        return api.fetch('char:SkillQueue', { characterId: character.get('characterId') }).then((result) => {
            let { skillqueue } = result;

            for (let id in skillqueue) {
                let skill = skillqueue[id];
                let skillId = parseInt(skill.typeID, 10);
                let queueStats = {
                    position: parseInt(skill.queuePosition, 10),
                    level: parseInt(skill.level, 10),
                    points: {
                        start: parseInt(skill.startSP, 10),
                        end: parseInt(skill.endSP, 10)
                    },
                    time: {
                        start: new Date(skill.startTime),
                        end: new Date(skill.endTime)
                    }
                };

                let skills = character.get('skills');
                for (let skill of skills) {
                    if (skill.skill.toString() == skillMapping[skillId].toString()) {
                        if (!skill.queued) {
                            skill.queued = [];
                        }
                        skill.queued.push(queueStats);
                        break;
                    }
                }
            }
        });
    }
}

class RefreshCharacterAccounts extends Interactor {
    *run() {
        let { apikey, character } = this;
        debug('refresh accounts');

        const api = apikey.getClient();
        return api.fetch('char:AccountBalance', { characterId: character.get('characterId') }).then((result) => {
            const { accounts } = result;
            let entries = [];

            for (let key of Object.keys(accounts)) {
                entries.push({
                    id: parseInt(key, 10),
                    key: parseInt(accounts[key].accountKey, 10),
                    balance: parseFloat(accounts[key].balance, 10),
                });
            }

            character.set('accounts', entries);
        });
    }
}

class RefreshCharacter extends Interactor {
    *run() {
        try {
            yield [
                RefreshCharacterStats.run(this),
                RefreshCharacterAccounts.run(this)
            ];

            yield RefreshCharacterSkillTree.run(this);

            let { character} = this;

            yield character.save();
        } catch (error) {
            debug(error);
        }
    }
}

RefreshCharacter.RefreshCharacterStats = RefreshCharacterStats;
RefreshCharacter.RefreshCharacterSkillTree = RefreshCharacterSkillTree;
RefreshCharacter.RefreshCharacterAccounts = RefreshCharacterAccounts;

module.exports = RefreshCharacter;
