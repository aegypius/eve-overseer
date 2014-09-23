mongoose        = require "mongoose"
{Schema}        = mongoose
Timestampable   = require "mongoose-timestamp"
UniqueValidator = require "mongoose-unique-validator"
Q               = require "q"
{Skill}         = require "./skill"

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

module.exports =
  SkillGroup:       mongoose.model('SkillGroup', SkillGroupSchema)
  SkillGroupSchema: SkillGroupSchema
