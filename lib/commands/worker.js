var Command = require('ronin').Command;

module.exports = Command.extend({
    desc: 'start a worker',
    run: function () {
        console.error(`worker ${process.pid} started`);
    }
});
