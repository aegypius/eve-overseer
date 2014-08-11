{Router} = require "express"
passport = require "passport"

user = new Router

user
  .get '/', (req, res, next)->
    res.render "index"


module.exports = user
