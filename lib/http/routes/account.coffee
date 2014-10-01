{Router} = require "express"
mongoose = require "mongoose"
account  = new Router

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
  .get    '/', (req, res, next)->
    res.status 400
      .send "Unauthorized"

  # Delete current logged user
  # ==========================
  .delete '/', (req, res, next)->
    res.status 400
      .send "Unauthorized"

  # Update current logged user
  # ==========================
  .put    '/', (req, res, next)->
    res.status 400
      .send "Unauthorized"

module.exports = account
