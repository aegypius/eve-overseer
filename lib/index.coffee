(require "dotenv").load()
pkg          = require "../package.json"

express      = require "express"
bodyParser   = require "body-parser"
morgan       = require "morgan"
path         = require "path"

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

app.use morgan('short')
app.use bodyParser.json()
app.use bodyParser.urlencoded { extended: true }
app.use express.static(path.join __dirname, "../public")

mongo_url = process.env.MONGO_DATABASE_URL or "mongodb://localhost/#{pkg.name}"

app.use cookieParser process.env.COOKIE_SECRET or pkg.name
app.use session {
  resave:            true
  saveUninitialized: true
  secret:            process.env_SESSION_SECRET or pkg.name
  store: new MongoStore({
    url: mongo_url
    collection: "sessions"
    auto_reconnect: true
  })
}

# Connect to database
(require "mongoose").connect mongo_url

passport = require "./config/passport"
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
  res.status 404

  return res.render "error"              if req.accepts "html"
  return res.json { error: "Not Found" } if req.accepts "json"
  return res
    .type "txt"
    .send "Not Found"


module.exports = server
module.exports.startServer = (port, publicDir, callback)->
  server.listen port, callback
