(require "dotenv").load()
debug    = (require "debug")('overseer:bootstrap')
pkg      = require "../package.json"

debug "Booting %s in '%s' mode", pkg.name, process.env.NODE_ENV || 'dev'

Q                  = require "q"
config             = require "./config"
Q.longStackSupport = true

{SkillGroup} = require "./models"

server = Q()
  .then ->
    debug "Connecting to database '#{config.database.url}'"

    mongoose = require "mongoose"
    return Q.Promise (resolve, fail, notify)->
      mongoose.connect config.database.url
      mongoose.connection.db
        .on "open",  resolve
        .on "error", fail
  .then ->
    debug "Upgrading database"
  .then SkillGroup.synchronize
  .then ->
    require "./http"

module.exports =
  server: server
  startServer: (port, publicDir, callback)->
    util = require "util"
    server
      .then (http)->
        http.listen port
      .done ->
        unless process.env.DEBUG
          util.log "Starting http server on http://localhost:#{port}"
        callback()
