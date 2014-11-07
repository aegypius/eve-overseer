mongoose = require "mongoose"

require "./user"
require "./oauth"
require "./character"
require "./apikey"
require "./skill"
require "./skill-group"
require "./static-data"

module.exports =
  User:       mongoose.model "User"
  Character:  mongoose.model "Character"
  SkillGroup: mongoose.model "SkillGroup"
  Skill:      mongoose.model "Skill"
  ApiKey:     mongoose.model "ApiKey"
