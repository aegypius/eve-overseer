express = require "express"
path    = require "path"

# Setup server
app     = express()
server  = (require "http").createServer app

app.set "port", process.env.PORT or 3333
app.use express.static(path.join __dirname, "../public")

module.exports = server
module.exports.startServer = (port, publicDir, callback)->
  server.listen port, callback
