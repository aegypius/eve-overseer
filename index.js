require('harmonize')(['harmony_destructuring']);
if ('production' === process.env.NODE_ENV) {
    try {
        require('newrelic');
    } catch (e) {}
}

var ronin = require('ronin');
var path  = require('path');
var program = ronin({
    path: path.join(__dirname, 'lib'),
    desc: require('./package.json').description,
    delimiter: ':'
});

program.run();
