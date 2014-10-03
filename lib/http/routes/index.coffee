{Router} = require "express"

api = new Router

api.use "/account",   require "./account"
api.use "/apikeys",   require "./apikeys"

module.exports = api
