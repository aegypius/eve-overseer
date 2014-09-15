#
# EVE API Service (http://wiki.eve-id.net/APIv2_Page_Index)
#
# Exposes EVE API to json
#

{Router}              = require "express"
{EveClient}           = require "neow"
{ensureAuthenticated} = require "../config/auth"
{ApiKey}              = require "../models/apikey"
{Character}           = require "../models/character"

router = new Router

# Returns character list
# ======================
router.route '/'
  .get ensureAuthenticated
  .get (req, res, next)->
    ApiKey.find { _user: req.user._id }, "characters"
      .populate('characters')
      .exec (err, apikeys)->
        return res.status(400).json err if err
        characters = []

        for apikey in apikeys
          for character in apikey.characters
            characters.push character

        res.status(200).json characters


# Returns character sheet
# =======================
router.route '/:id'
  .get ensureAuthenticated
  .get (req, res, next)->
    Character.findOne { id: req.params.id }
      .exec (err, character)->
        return res.status(400).json err if err
        res.status(200).json character

router.route '/:id/skills/queue'
  .get ensureAuthenticated
  .get (req, res, next)->
    for apikey in req.user.apikeys
      api = new EveClient {
        keyID: apikey.id
        vCode: apikey.verification
      }

      api.fetch 'char:SkillQueue', {
        characterID: req.params.id
      }
        .then (result)->
          skillqueue = result.skillqueue
          ids = (job.typeID for id, job of skillqueue)

          api.fetch 'eve:TypeName', {
            ids: ids
          }
          .then (result)->
            types = result.types
            for id, job of skillqueue
              job.typeName = v.typeName for k, v of types when k is job.typeID
            return skillqueue

        .then (skillqueue)->
          res.json skillqueue

        .fail (err)->
          console.error err
          next()
        .done()

module.exports = router
