if ('production' === process.env.NODE_ENV) {
  try {
    require("newrelic");
  } catch (e) {}
}
require('coffee-script/register');

var ronin = require('ronin');
var path  = require('path');
var program = ronin({
  path: path.join(__dirname, 'lib'),
  desc: 'Overseer',
  delimiter: ':'
});

program.run();
