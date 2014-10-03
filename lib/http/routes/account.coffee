{Router}              = require "express"
mongoose              = require "mongoose"
account               = new Router

User                  = mongoose.model "User"
ApiKey                = mongoose.model "ApiKey"

account

  # Register a new account
  # ======================
  .post   '/', (req, res, next)->
    user = new User req.body

    user.save (err)->
      return res.status(400).json(err) if err
      res.status(201).end()

  # Get current logged user profile
  # ===============================
  .get    '/', (req, res, next)->
    User
      .findById req.user.id
      .exec (err, user)->
        if err
          res.status 400
          res.send err
        else if user is null
          res.status 404
          res.send { error: "User not found"}
        else
          res.send user.profile

  # Update current logged user
  # ==========================
  .put    '/', (req, res, next)->
    User
      .findById req.user.id
      .exec (err, user)->
        if err
          res.status 400
          res.send err
        else if user is null
          res.status 404
          res.send { error: "User not found" }
        else
          for property, value of req.body
            user.set property, value

          user
            .validate (err)->
              return res.status(400).json err if err
              user.save (err)->
                return res.status(400).json err if err
                res.status 202
                res.end()

  # Delete current logged user
  # ==========================
  .delete '/', (req, res, next)->
    res.status 200
      .send "OK"

  # Add an new ApiKey
  # =================
  .post '/apikeys', (req, res, next)->
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
  .get '/apikeys', (req, res, next)->
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
  .get '/apikeys/:apikey_id', (req, res, next)->
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
  .delete '/apikeys/:apikey_id', (req, res, next)->
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
          apikey.remove().then ->
            res.status 200
            res.end()

module.exports = account
