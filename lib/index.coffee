(require "dotenv").load()
express    = require "express"
bodyParser = require "body-parser"
morgan     = require "morgan"
path       = require "path"

# Setup server
app     = express()
server  = (require "http").createServer app

app.set "port", process.env.PORT or 3333
app.use morgan('short')
app.use bodyParser.json()
app.use bodyParser.urlencoded { extended: true }
app.use express.static(path.join __dirname, "../public")

app.use "/api", require "./api"

app.use require "./middleware/error"

module.exports = server
module.exports.startServer = (port, publicDir, callback)->
  server.listen port, callback
