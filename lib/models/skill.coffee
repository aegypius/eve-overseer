mongoose        = require "mongoose"
{Schema}        = mongoose
Timestampable   = require "mongoose-timestamp"
UniqueValidator = require "mongoose-unique-validator"
Q               = require "q"

SkillSchema  = new Schema {
  id: {
    type:     String
    unique:   true
    required: true
  }
  group: {
    type: Schema.ObjectId
    ref:  'SkillGroup'
  }
  name:        String
  description: String
  rank:        Number
  requirements: [{
    skill: {
      type: Schema.ObjectId
      ref:  'Skill'
    }
    level: Number
  }]
  attributes: []
  bonuses:[]
  published: Boolean
}

mongoose.model 'Skill', SkillSchema

module.exports = SkillSchema
