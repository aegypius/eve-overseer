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

      if req.body.apikeys?
        user.apikeys = []
        for id, apikey in req.body.apikeys
          user.apikeys.push apikey

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

module.exports = user
