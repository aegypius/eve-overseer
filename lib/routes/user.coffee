{Router} = require "express"
passport = require "passport"
{User}   = require "../models/user"
{ApiKey} = require "../models/apikey"


user = new Router

user
  .get '/', (req, res, next)->
    res.render "index"

  .get '/:id', (req, res, next)->
    User.findById req.params.id, (err, user)->
      return res.status(400).json(err) if err

      res.json user.user_info

  .put '/:id', (req, res, next)->
    User.findById req.params.id, (err, user)->
      return res.status(400).json(err) if err

      if req.body.email?
        err = {message: "Email is read-only"}
        return res.status(400).json err

      if req.body.username?
        user.username = req.body.username

      if req.body.password?
        user.password = req.body.password

      user.save (err, user)->
        return res.status(400).json(err) if err
        res.json user.user_info

  .post '/', (req, res, next)->
    user = new User req.body
    user.provider = 'local'
    user.save (err)->
      return res.status(400).json(err) if err

      req.login user, (err)->
        return next(err) if err
        res.json user.user_info

user
  .get "/:id/apikey", (req, res, next)->
    ApiKey.find {_user: req.params.id} , (err, apikeys)->
      return res.status(400).json(err) if err
      res.json apikeys

  .post "/:id/apikey", (req, res, next)->
    apikey = new ApiKey {
      _user:            req.params.id
      keyId:            req.body.keyId
      verificationCode: req.body.verificationCode
    }

    apikey.save (err, apikey)->
      return res.status(400).json(err) if err
      res.status(200).json apikey

  .delete "/:id/apikey/:apikey_id", (req, res, next)->
    ApiKey.findOne {
      _id:   req.params.apikey_id
      _user: req.params.id
    }, (err, apikey)->
      return res.status(400).json(err) if err
      apikey.remove().then ->
        res.status(200).end()

module.exports = user
