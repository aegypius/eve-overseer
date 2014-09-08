pkg = require "../../package.json"

if process.env.NODE_ENV is "test"
  url = "mongodb://#{process.env.WERCKER_MONGODB_HOST}/#{pkg.name}-tests"

else if process.env.NODE_ENV is "production"
  url = process.env.MONGOHQ_URL

else
  url = "mongodb://localhost/#{pkg.name}"

module.exports =
  url: url
