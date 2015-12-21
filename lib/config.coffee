pkg = require "../package.json"

if process.env.NODE_ENV is "test"
  url = (process.env.MONGO_PORT_27017_TCP.replace /^tcp:/, "mongodb:") + \
        "/#{pkg.name}-tests"

else if process.env.NODE_ENV is "production"
  url = process.env.MONGOHQ_URL

else
  url = "mongodb://localhost/#{pkg.name}"

module.exports =
  database:
    url: url
