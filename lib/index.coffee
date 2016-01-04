debug    = (require "debug")('overseer:bootstrap')
pkg      = require "../package.json"
env      = process.env.NODE_ENV || 'development'

debug "Booting %s in '%s' mode", pkg.name, env

Q                  = require "q"
config             = require "./config"
Q.longStackSupport = true
models             = require "./models"

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
    (require "./workers/database/upgrade")()

  .then ->
    require "./http"

module.exports =
  server: server
  startServer: (port, publicDir, callback)->
    server
      .then (http)->
        http.listen port
      .done ->
        unless process.env.DEBUG
          console.log "Starting http server on port #{port}"
        callback() if callback
