{Router}              = require "express"
passport              = require "passport"
{ensureAuthenticated} = require "../../config/auth"
{User}                = require "../../models/user"

authorize = new Router

authorize.route '/'
  .post (passport.authenticate "local", session: false), (req, res, next)->
    res.json req.user.card

  .delete (passport.authenticate "local", session: false), (req, res, next)->
    return res.status(400).json "Not logged in" unless req.user

    req.logout()
    res.end()

module.exports = authorize
