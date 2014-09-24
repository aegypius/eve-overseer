if ('production' === process.env.NODE_ENV) {
  require("newrelic");
}

require('coffee-script/register');
var overseer = require('./lib'),
    server = overseer.server,
    port   = process.env.PORT || 3333
;

module.exports = overseer;

if (require.main === module) {
  overseer.startServer(port, "public", function () {
    console.log("Server listening on http://localhost:" + port);
  });
}
