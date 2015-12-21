pkg = require "../package.json"

if process.env.NODE_ENV is "test"
  url = (process.env.MONGO_PORT_27017_TCP.replace /^tcp:/, "mongodb:") + \
        "/#{pkg.name}-tests"

else if process.env.NODE_ENV is "production"
  url = process.env.MONGOHQ_URL

else
  url = ((process.env.MONGO_PORT_27017_TCP or "mongodb://localhost").replace /^tcp:/, "mongodb:") + \
        "/#{pkg.name}"

module.exports = config =
  database:
    url: url
