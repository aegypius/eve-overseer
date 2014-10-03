program  = require "commander"
mongoose = require "mongoose"
pkg      = require "../package.json"
Q        = require "q"

program
  .version     pkg.version
  .command     "upgrade"
  .description "Upgrade static collections"
  .action ->
    {SkillGroup} = require "./models"

    Q()
      .then ->
        require "./config"

      .then (config)->
        mongoose.connect config.database.url

      .then SkillGroup.synchronize

      .fail (err)->
        throw err

      .done (result)->
        mongoose.disconnect()

module.exports = program
