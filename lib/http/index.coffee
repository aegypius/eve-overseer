pkg          = require "../../package.json"

express      = require "express"
bodyParser   = require "body-parser"
morgan       = require "morgan"
path         = require "path"

config       = require "../config"

# Setup server
app     = express()
server  = (require "http").createServer app

app.set "port", process.env.PORT     or 3333
app.set "env",  process.env.NODE_ENV or "development"

app.use morgan('short') unless process.env.NODE_ENV is "test"
app.use bodyParser.json()
app.use bodyParser.urlencoded { extended: true }
app.use express.static(path.join __dirname, "../../public")

passport = config.passport
app.use passport.initialize()

# View Engine
app.set 'views', path.join __dirname, './views'
app.set 'view engine', 'jade'

if app.get("env") is "production"
  app.disable "x-powered-by"

app.use "/api", require "./api"
(require "./routes")(app)

# Handles Error Pages
app.use (req, res, next)->
  if req.accepts("html") and /\/api\//.test(req.path) isnt true
    return res.status(200).render "index"
  return res.status(404).json { error: "Not Found" } if req.accepts "json"
  return res.status(404).type("txt").send "Not Found"

module.exports = server
