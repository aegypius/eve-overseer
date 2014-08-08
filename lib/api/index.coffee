{Router} = require "express"

api = new Router

api.use "/character", require "./character"

module.exports = api
