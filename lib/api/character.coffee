#
# EVE API Service (http://wiki.eve-id.net/APIv2_Page_Index)
#
# Exposes EVE API to json
#

{Router}              = require "express"
{EveClient}           = require "neow"
{ensureAuthenticated} = require "../config/auth"

router = new Router

# Returns character list
# ======================
router.route '/'
  .get ensureAuthenticated
  .get (req, res, next)->

    for apikey in req.user.apikeys
      api = new EveClient {
        keyID: apikey.id
        vCode: apikey.verification
      }

      api.fetch 'account:Characters'
        .then (result)->
          res.json (character for id, character of result.characters)
        .fail (err)->
          console.error err
          next()
        .done()


# Returns character sheet
# =======================
router.route '/:id'
  .get ensureAuthenticated
  .get (req, res, next)->

    unwrap = (value)->
      value = value.content or value
      if value is Object(value)
        for key, dict of value
          value[key] = unwrap dict
      return value

    for apikey in req.user.apikeys
      api = new EveClient {
        keyID: apikey.id
        vCode: apikey.verification
      }

      api.fetch 'char:CharacterSheet', {
        characterID: req.params.id
      }
        .then (result)->
          character = {}

          for key, value of result
            character[key] = unwrap value

          res.json character

        .fail (err)->
          console.error err
          next()

        .done()

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
