{ensureAuthenticated} = require "../../config/auth"

module.exports = (app, passeport)->

  app.use "/api/authorize", require "./authorize"
  app.use "/api/users",     require "./user"

  app.get "/logout", (req, res, next)->
    req.logout()
    next()
