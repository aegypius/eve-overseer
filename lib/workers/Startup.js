'use strict';

const Interactor = require('interactor');
const debug = require('debug')('overseer:job:startup');
const DatabaseMigrate = require('./DatabaseMigrate');

class Startup extends Interactor
{
    organize() {
        return [
            DatabaseMigrate
        ];
    }
}

module.exports = Startup;
