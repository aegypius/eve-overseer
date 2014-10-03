{Router}              = require "express"
mongoose              = require "mongoose"
account               = new Router

User                  = mongoose.model "User"

account

  # Register a new account
  # ======================
  .post   '/', (req, res, next)->
    user = new User req.body

    user.save (err)->
      return res.status(400).json(err) if err
      res.status(201).end()

  # Get current logged user profile
  # ===============================
  .get    '/', (req, res, next)->
    User
      .findById req.user.id
      .exec (err, user)->
        if err
          res.status 400
          res.send err
        else if user is null
          res.status 404
          res.send { error: "User not found"}
        else
          res.send user.profile

  # Update current logged user
  # ==========================
  .put    '/', (req, res, next)->
    User
      .findById req.user.id
      .exec (err, user)->
        if err
          res.status 400
          res.send err
        else if user is null
          res.status 404
          res.send { error: "User not found" }
        else
          for property, value of req.body
            user.set property, value

          user
            .validate (err)->
              return res.status(400).json err if err
              user.save (err)->
                return res.status(400).json err if err
                res.status 202
                res.end()

  # Delete current logged user
  # ==========================
  .delete '/', (req, res, next)->
    res.status 200
      .send "OK"

module.exports = account
