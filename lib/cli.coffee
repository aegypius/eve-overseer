program  = require "commander"
mongoose = require "mongoose"
pkg      = require "../package.json"
Q        = require "q"
models   = require "./models"
debug    = (require "debug")("overseer:cli")

program
  .version     pkg.version
  .command     "database:upgrade"
  .description "Upgrade database"
  .action ->
    Q()
      .then ->
        debug "Database upgrade started"
        require "./config"

      .then (config)->
        mongoose.connect config.database.url

      .then ->
        {SkillGroup} = models
        debug "Loading : Skill Tree"
        SkillGroup.synchronize()

      .fail (err)->
        throw err

      .done (result)->
        debug "Upgrade completed"
        mongoose.disconnect()

module.exports = program
