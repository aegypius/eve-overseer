{Router}       = require "express"
passport       = require "passport"
{ensureAuthenticated} = require "../../middleware/authorization"


auth = new Router

auth.route '/session'

  .get ensureAuthenticated
  .get (req, res, next)->
    res.json req.user.user_info

  .post (req, res, next)->
    (->
      passport.authentificate "locale", (err, user, info)->
        error = err or info

        if error
          return res.status 400
             .json error

        req.logIn user, (err)->
          return res.send err if err

          res.json req.user.user_info
    )(req, res, next)


  .delete (req, res, next)->
    return res.send 400, "Not logged in" unless req.user

    req.logout()
    res.status 200

module.exports = auth