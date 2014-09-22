#
# EVE API Service (http://wiki.eve-id.net/APIv2_Page_Index)
#
# Exposes EVE API to json
#

{Router}              = require "express"
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

        character.refresh()
          .done (character)->
            res.status(200).json character

# Returns character skill queue
# =============================
router.route '/:id/skills/queue'
  .get ensureAuthenticated
  .get (req, res, next)->
    Character
      .findOne  { id: req.params.id }
      .populate "apikey"
      .exec (err, character)->
        api = apikey.getClient()

        api
          .fetch 'char:SkillQueue', {
            characterID: character.id
          }
          .then (result)->
            skillqueue = []
            for id, job of result.skillqueue
              skillqueue.push job

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
            skillqueue.map (skill)->
              {
                id:       skill.typeID
                name:     skill.typeName
                level:    skill.level
                position: skill.queuePosition
                skillPoints: {
                  start: skill.startSP
                  end:   skill.endSP
                }
                timeRange: {
                  start: skill.startTime
                  end:   skill.endTime
                }
              }

          .fail (err)->
            console.error err
            next()

          .done (skillqueue)->
            res.json skillqueue


module.exports = router
