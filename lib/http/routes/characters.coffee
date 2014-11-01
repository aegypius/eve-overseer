#
# EVE API Service (http://wiki.eve-id.net/APIv2_Page_Index)
#
# Exposes EVE API to json
#
{Router}              = require "express"
mongoose              = require "mongoose"

ApiKey                = mongoose.model "ApiKey"
Character             = mongoose.model "Character"

characters            = new Router

characters.param "characterId", (req, res, next, id)->
  Character
    .findOne { id: id }
    .populate "apikey"
    .exec (err, character)->
      if err
        res.status 400
        res.send err
      else if character is null
        res.status 404
        res.send "Character Not Found"
      else
        req.character = character
        next()


characters

  # Get a list of characters
  # ========================
  .get '/', (req, res, next)->
    ApiKey.find {
      _user: req.user.id
    }
    .populate('characters')
    .exec (err, apikeys)->
      return res.status(400).json err if err
      characters = []
      for apikey in apikeys
        for character in apikey.characters
          characters.push {
            id:          character.id
            name:        character.name
            corporation: character.corporation
            alliance:    character.alliance
            faction:     character.faction
            picture:     character.picture
          }

      res.status(200).json characters

  # Get detailed informations for a character
  # =========================================
  .get '/:characterId', (req, res, next)->
    req.character
      .refresh()
      .done (character)->
        res.status 200
        res.json character

  # Returns character skill queue
  # =============================
  .get '/:characterId/skills', (req, res, next)->

    filter = req.query.filter or "learned"

    req.character
      .getSkillTree {
        filter: filter
      }
      .then (tree)->
        res.status 200
        res.json tree

  # Returns financial accounts of a character
  # =========================================
  .get '/:characterId/accounts', (req, res, next)->
    req.character
      .getAccounts()
      .then (list)->
        res.status 200
        res.json list

  # Returns financial accounts of a character
  # =========================================
  .get '/:characterId/accounts/:accountKey', (req, res, next)->
    req.character
      .getAccountsLogs req.params
      .then (list)->
        res.status 200
        res.json list


module.exports = characters
