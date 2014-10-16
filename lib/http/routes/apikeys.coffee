{Router}              = require "express"
mongoose              = require "mongoose"

ApiKey                = mongoose.model "ApiKey"

apikeys               = new Router

apikeys
  # Add an new ApiKey
  # =================
  .post '/', (req, res, next)->
    apikey = new ApiKey {
      _user:            req.user.id
      keyId:            req.body.keyId
      verificationCode: req.body.verificationCode
    }

    apikey.save (err, apikey)->
      return res.status(400).json(err) if err
      res.status(201).end()


  # List ApiKeys
  # =============
  .get '/', (req, res, next)->
    ApiKey
      .find { _user: req.user.id }
      .exec (err, apikeys)->
        if err
          return res.status(400).send(err) if err
        else
          res.status 200
          res.send apikeys.map (apikey)->
            {
              keyId:            apikey.keyId
              verificationCode: apikey.verificationCode
              expires:          apikey.expires
              accessMask:       apikey.accessMask
              characters:       apikey.characters.length
            }

  # Get ApiKey details
  # ==================
  .get '/:apikey_id', (req, res, next)->
    ApiKey
      .findOne {
        _user: req.user.id,
        keyId: req.params.apikey_id
      }
      .exec (err, apikey)->
        if err
          res.status 400
          res.send err
        else if apikey is null
          res.status 404
          res.end()
        else
          res.status 200
          res.send {
            keyId:            apikey.keyId
            verificationCode: apikey.verificationCode
            expires:          apikey.expires
            accessMask:       apikey.accessMask
            characters:       apikey.characters
            account:          apikey.account
          }

  # Delete an ApiKey
  # ================
  .delete '/:apikey_id', (req, res, next)->
    ApiKey
      .findOne {
        _user: req.user.id,
        keyId: req.params.apikey_id
      }
      .exec (err, apikey)->
        if err
          res.status 400
          res.send err
        else if apikey is null
          res.status 404
          res.end()
        else
          apikey.remove (err)->
            if err
              res.status 400
              res.send err
            else
              res.status 200
              res.end()

module.exports = apikeys
