debug        = (require "debug")("overseer:cli")
Q            = require "q"
mongoose     = require "mongoose"
models       = require "../models"

SkillGroups  = mongoose.model "SkillGroup"
OAuthClients = mongoose.model "OAuthClients"
StaticData   = mongoose.model "Versions"

module.exports =
  database:
    upgrade: ->
      Q()
        # Register OAuth2 Clients
        .then ->
          if process.env.CLIENT_ID and process.env.CLIENT_SECRET
            clientId     = process.env.CLIENT_ID
            clientSecret = process.env.CLIENT_SECRET

            OAuthClients
              .findOne { clientId: clientId }
              .exec()
              .then (client)->
                unless client
                  OAuthClients.create {
                    clientId:     clientId
                    clientSecret: clientSecret
                    redirectUri:  '/login'
                  }
        .then StaticData.import
        .then SkillGroups.synchronize
