if ('production' === process.env.NODE_ENV) {
  try {
    require("newrelic");
  } catch (e) {}
}

require('coffee-script/register');
var overseer = require('./lib'),
    port   = process.env.PORT || 3333
;

module.exports = overseer;

if (require.main === module) {
  overseer.startServer(port, "public", function () {
    require('debug')('overseer:http')(("Server listening on http://localhost:" + port));
  });
}
