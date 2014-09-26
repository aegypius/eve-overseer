passport      = require "passport"
LocalStrategy = (require "passport-local").Strategy
{User}        = require "../models/user"

passport.serializeUser (user, done)->
  done null, user._id

passport.deserializeUser (_id, done)->
  User.findOne { _id: _id }, (err, user)->
    done err, user

passport.use "local", new LocalStrategy({
  usernameField: "email"
  passwordField: "password"
}, (email, password, done)->
  process.nextTick ()->
    email = email.toLowerCase()
    User.findOne { email: email }, (err, user)->
      return done err if err

      unless user
        return done null, false, {
          errors:
            email: 'Email is not registered'
        }

      unless user.authentificate password
        return done null, false, {
          errors:
            password: 'Password is incorrect'
        }

      return done null, user
)

module.exports = passport
