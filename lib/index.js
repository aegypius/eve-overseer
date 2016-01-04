var debug    = require("debug")('overseer:bootstrap')
var pkg      = require("../package.json")
var env      = process.env.NODE_ENV || 'development'

debug("Booting %s in '%s' mode", pkg.name, env);

var Q                  = require("q");
var config             = require("./config");
var models             = require("./models");

Q.longStackSupport = true;

server = function() {
  return Q.Promise(function (resolve, fail, notify) {
    debug("Connecting to database '%s'", config.database.url);

    mongoose = require("mongoose");
    mongoose.connect(config.database.url);
    var db = mongoose.connection.db
    db
      .on("open",  resolve)
      .on("error", fail)
    ;

  }).then(function () {
    return require("./workers/database/upgrade")()
  }).then(function () {
    return require('./http');
  });
};

module.exports = {
  server: server,
  startServer: function (port, publicDir, callback) {
    server()
      .then(function (http) {
        return http.listen(port || process.env.PORT || 3333);
      })
      .done(function () {
        var log = !process.env.DEBUG ? console.log : debug;
        log("HTTP server listening on port %s", port || process.env.PORT || 3333);
        if (callback) callback();
      })
    ;
  }
};
