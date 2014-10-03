mongoose        = require "mongoose"
{Schema}        = mongoose
Timestampable   = require "mongoose-timestamp"
UniqueValidator = require "mongoose-unique-validator"
Q               = require "q"
{EveClient}     = require "neow"
Skill           = mongoose.model "Skill"

SkillGroupSchema  = new Schema {
  id: {
    type:     Number
    unique:   true
    required: true
  }
  name:        String
  skills: [{
    type: Schema.ObjectId
    ref: 'Skill'
  }]
}

SkillGroupSchema.statics.synchronize = ->
  api = new EveClient
  return api
    .fetch 'eve:SkillTree'
    .then (result)->
      (value for id, value of result.skillGroups)
    .then (groups)->
      SkillGroup = mongoose.model "SkillGroup"
      Q.all groups.map (group)->
        # Update skill group
        SkillGroup.findOneAndUpdate {
          id: group.groupID
        }, {
          id:   group.groupID
          name: group.groupName
        }, {
          upsert: true
        }
        .exec()
        .then (group)->
          skills = (v.skills for k, v of groups when (parseInt v.groupID) is group.id)
          skills = (value for id, value of skills[0])
          Q.all skills.map (skill)->
            requirements = (v for k, v of skill.requiredSkills)
            Q.all requirements.map (skill)->
              Skill.findOneAndUpdate {
                id: skill.typeID
              }, {
                id: skill.typeID
              }, {
                upsert: true
              }
              .exec()
              .then (result)->
                {
                  _id: result._id
                  level: skill.skillLevel
                }
            .then (requirements)->
              attributes = []
              bonuses    = []
              for k, v of skill.requiredAttributes
                attributes.push v.content

              for k, v of skill.skillBonusCollection
                bonuses.push {
                  type:  v.bonusType
                  value: v.bonusValue
                }

              Skill.findOneAndUpdate {
                id: skill.typeID
              }, {
                id:           skill.typeID
                name:         skill.typeName
                description:  skill.description.content
                rank:         skill.rank.content
                group:        group._id
                requirements: requirements
                attributes:   attributes
                bonuses:      bonuses
                published:    skill.published
              }, {
                upsert: true
              }
              .exec()
              .then (skill)->
                if -1 is group.skills.indexOf skill._id
                  group.skills.push skill._id
                SkillGroup.findOneAndUpdate {
                  id : group.id
                }, {
                  skills: group.skills
                }
                .exec()


mongoose.model "SkillGroup", SkillGroupSchema

module.exports = SkillGroupSchema
