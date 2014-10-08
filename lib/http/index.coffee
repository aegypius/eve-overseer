pkg          = require "../../package.json"

express      = require "express"
bodyParser   = require "body-parser"
morgan       = require "morgan"
path         = require "path"
oauth2server = require "oauth2-server"
debug        = (require "debug")("overseer:http")

config       = require "../config"

# Setup server
app     = express()

publicFiles = path.join __dirname, "../../public"

app.set "port", process.env.PORT     or 3333
app.set "env",  process.env.NODE_ENV or "development"

app.disable "x-powered-by" if "production" is app.get "env"

app.use morgan('short') unless "test" is app.get "env"
app.use bodyParser.json()
app.use bodyParser.urlencoded { extended: true }

# oAuth2 Authorization server
# ===========================
app.oauth = oauth2server {
  model:  require "../models/oauth"
  grants: [
    "password"
    "refresh_token"
    "client_credentials"
  ]
  debug: "development" is app.get "env"
  passthroughErrors: true
}

app.all "/oauth/token", app.oauth.grant()
app.use "/api", app.oauth.authorise(), require "./routes"
app.use express.static publicFiles

# Handles OAuth2 Errors
app.use (err, req, res, next)->
  next() unless err.name is 'OAuth2Error'

  res.status 401
  res.send {
    status: "failure"
    error:  "Unauthorized"
  }
  debug "#{err.name} : #{err.message}"

# Handles Error Pages
app.use (req, res, next)->
  if req.accepts("html") and /\/api\//.test(req.path) isnt true
    return res.sendFile path.join publicFiles, "/index.html"
  return res.status(404).json { error: "Not Found" } if req.accepts "json"
  return res.status(404).type("txt").send "Not Found"

module.exports = app
