module.exports = (app, passeport)->

  app.use "/auth", require "./auth"

  app.get "/", (req, res)->
    res.render "index"

  app.get "/login", (req, res)->
    res.render "index", {
      message: req.flash('login-message')
    }

  app.get "/signup", (req, res)->
    res.render "index", {
      message: res.flash('signup-message')
    }

  app.get "/profile", ensureAuthenticated, (req, res)->
    res.render "index", {
      user: req.user
    }

  app.get "/logout", (req, res)->
    req.logout()
    res.redirect "/"
