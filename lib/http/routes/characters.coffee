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
    req.character
      .getSkillTree()
      .then (tree)->
        res.status 200
        res.json tree


#    router.route '/:id/skills/queue'
#      .get (req, res, next)->
#        Character
#          .findOne  { id: req.params.id }
#          .populate "apikey"
#          .exec (err, character)->
#            api = character.apikey.getClient()
#
#            api
#              .fetch 'char:SkillQueue', {
#                characterID: character.id
#              }
#              .then (result)->
#                skillqueue = []
#                for id, job of result.skillqueue
#                  skillqueue.push job
#
#                ids = (job.typeID for id, job of skillqueue)
#
#                api.fetch 'eve:TypeName', {
#                  ids: ids
#                }
#                .then (result)->
#                  types = result.types
#                  for id, job of skillqueue
#                    job.typeName = v.typeName for k, v of types when k is job.typeID
#                  return skillqueue
#
#              .then (skillqueue)->
#                skillqueue.map (skill)->
#                  {
#                    id:       skill.typeID
#                    name:     skill.typeName
#                    level:    skill.level
#                    position: skill.queuePosition
#                    skillPoints: {
#                      start: skill.startSP
#                      end:   skill.endSP
#                    }
#                    timeRange: {
#                      start: skill.startTime
#                      end:   skill.endTime
#                    }
#                  }
#
#              .fail (err)->
#                console.error err
#                next()
#
#              .done (skillqueue)->
#                res.json skillqueue


module.exports = characters
