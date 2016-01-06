const { Router } = require('express');

const api = new Router();

api.use('/account', require('./account'));
api.use('/apikeys', require('./apikeys'));
api.use('/characters', require('./characters'));

module.exports = api;
