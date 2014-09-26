{Router}              = require "express"
passport              = require "passport"
{ensureAuthenticated} = require "../config/auth"
{User}                = require "../models/user"

session = new Router

session.route '/'

  .get ensureAuthenticated
  .get (req, res, next)->
    User.findById { _id: req.user._id }, (err, user)->
      return res.status(400).json(err) if err
      res.json user.user_info

  .post (req, res, next)->
    passport.authenticate('local', (err, user, info)->
      error = err or info

      return res.status(400).json(error) if error

      req.login user, (err)->
        return res.send(err) if err
        res.json req.user.user_info

    )(req, res, next);


  .delete (req, res, next)->
    return res.status(400).json "Not logged in" unless req.user

    req.logout()
    res.status 200
    res.end()

module.exports = session
