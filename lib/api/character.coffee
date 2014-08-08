{Router}    = require "express"
{EveClient} = require "neow"

router = new Router

api = new EveClient {
  keyID: process.env.EVE_API_KEY_ID
  vCode: process.env.EVE_API_VERIFICATION_CODE
}

# Returns character list
# ======================
router.route('/')
  .get (req, res, next)->
    api.fetch 'account:Characters'
      .then (result)->
        res.json (character for id, character of result.characters)
      .done()


# Returns character sheet
# =======================
router.route('/:id')
  .get (req, res, next)->

    unwrap = (value)->
      value = value.content or value
      if value is Object(value)
        for key, dict of value
          value[key] = unwrap dict
      return value


    api.fetch 'char:CharacterSheet', {
      characterID: req.params.id
    }
      .then (result)->
        character = {}

        for key, value of result
          character[key] = unwrap value

        res.json character
      .done()

module.exports = router
