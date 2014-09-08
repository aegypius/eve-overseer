{ensureAuthenticated} = require "../config/auth"

module.exports = (app, passeport)->

  app.use "/session", require "./session"
  app.use "/user",    require "./user"

  app.get "/", (req, res)->
    res.render "index"

  app.get "/login", (req, res)->
    res.render "index", {
      message: req.flash('login-message')
    }

  app.get "/signup", (req, res)->
    res.render "index", {
      message: req.flash('signup-message')
    }

  app.get "/profile", ensureAuthenticated, (req, res)->
    res.render "index", {
      message: req.flash('user-profile')
    }

  app.get "/logout", (req, res)->
    req.logout()
    res.redirect "/"
