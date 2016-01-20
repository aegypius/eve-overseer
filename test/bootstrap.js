require('harmonize')(['harmony_destructuring']);

global.chai      = require('chai');
global.co        = require('co');
global.should    = chai.should();
global.expect    = chai.expect;
global.assert    = require('assert');
global.casual    = casual = require('casual');
global.debug     = debug = require('debug')('overseer:test');
global.env       = process.env.NODE_ENV;
global.port      = process.env.PORT || 3333;
global.request   = require('supertest-as-promised');
global.server    = require('../lib');

assert(env !== 'production', `Tests must not be run in production environment (NODE_ENV=${env})`);

global.oauth = {
    clientId:     process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    token: null
};

global.user      = {
    email:    casual.email,
    username: casual.username,
    password: 'password',
};

global.apiKey = {
    keyId:            process.env.TEST_EVEONLINE_API_ID,
    verificationCode: process.env.TEST_EVEONLINE_VERIFICATION_CODE,
};
