{Router} = require "express"
passport = require "passport"
User     = require "../models/user"


user = new Router

user
  .get '/', (req, res, next)->
    res.render "index"

  .post '/', (req, res, next)->
    user = new User req.body
    user.provider = 'local'
    user.save (err)->
      return res.status(400).json(err) if err

      req.login user, (err)->
        return next(err) if err
        res.json user.user_info

module.exports = user
