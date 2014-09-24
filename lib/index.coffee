(require "dotenv").load()
pkg          = require "../package.json"

express      = require "express"
bodyParser   = require "body-parser"
morgan       = require "morgan"
path         = require "path"

config       = require "./config"

# Session management
cookieParser = require "cookie-parser"
session      = require "express-session"
MongoStore   = (require "connect-mongo") { session: session }
flash        = require "express-flash"

# Setup server
app     = express()
server  = (require "http").createServer app

app.set "port", process.env.PORT     or 3333
app.set "env",  process.env.NODE_ENV or "development"

app.use morgan('short') unless process.env.NODE_ENV is "test"
app.use bodyParser.json()
app.use bodyParser.urlencoded { extended: true }
app.use express.static(path.join __dirname, "../public")

# Connect to database
(require "mongoose").connect config.database.url

app.use cookieParser process.env.COOKIE_SECRET or pkg.name
app.use session {
  resave:            true
  saveUninitialized: true
  secret:            process.env.SESSION_SECRET or pkg.name
  store: new MongoStore({
    url: config.database.url
    collection: "sessions"
    auto_reconnect: true
  })
}

passport = config.passport
app.use passport.initialize()
app.use passport.session()
app.use flash()

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

module.exports =
  server: server
  startServer: (port, publicDir, callback)->
    server.listen port, callback
