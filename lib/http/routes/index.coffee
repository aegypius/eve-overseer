{ensureAuthenticated} = require "../../config/auth"

module.exports = (app, passeport)->

  app.use "/api/authorize", require "./authorize"
  app.use "/api/users",     require "./user"

  app.get "/", (req, res)->
    res.render "index"

  app.get "/logout", (req, res)->
    req.logout()
    res.redirect "/"
