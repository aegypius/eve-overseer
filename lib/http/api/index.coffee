{Router} = require "express"

api = new Router

api.use "/characters", require "./character"

module.exports = api
