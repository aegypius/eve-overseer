{Router}              = require "express"
mongoose              = require "mongoose"
{ensureAuthenticated} = require "../../config/auth"
account               = new Router

account

  # Register a new account
  # ======================
  .post   '/', (req, res, next)->
    User = mongoose.model("User")
    user = new User req.body

    user.save (err)->
      return res.status(400).json(err) if err

      req.login user, (err)->
        return next(err) if err
        res.json user.card

  # Get current logged user profile
  # ===============================
  .get ensureAuthenticated
  .get    '/', (req, res, next)->
    res.status 200
      .send "OK"

  # Delete current logged user
  # ==========================
  .get ensureAuthenticated
  .delete '/', (req, res, next)->
    res.status 200
      .send "OK"

  # Update current logged user
  # ==========================
  .get ensureAuthenticated
  .put    '/', (req, res, next)->
    res.status 200
      .send "OK"

module.exports = account
