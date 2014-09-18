if ('production' === process.env.NODE_ENV) {
  require("newrelic");
}

require('coffee-script/register');
var server = require('./lib'),
    port   = process.env.PORT || 3333
;

module.exports = server;

if (require.main === module) {
  server.startServer(port, "public", function () {
    console.log("Server listening on http://localhost:" + port);
  });
}
