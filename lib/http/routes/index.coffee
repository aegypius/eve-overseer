{Router} = require "express"

api = new Router

api.use "/account",   require "./account"

module.exports = api
