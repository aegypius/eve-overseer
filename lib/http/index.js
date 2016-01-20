const pkg          = require('../../package.json');
const express      = require('express');
const bodyParser   = require('body-parser');
const morgan       = require('morgan');
const path         = require('path');
const oauth2server = require('oauth2-server');
const debug        = require('debug')('overseer:http');
const config       = require('../config');

// Setup server
app     = express();

publicFiles = path.join(__dirname, '../../public');

app.set('port', process.env.PORT || 3333);
app.set('env',  process.env.NODE_ENV || 'development');

if (app.get('env') === 'production') {
    app.disable('x-powered-by');
}
if (app.get('env') !== 'test') {
    app.use(morgan('short'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// oAuth2 Authorization server
app.oauth = oauth2server({
    model:  require('../models/oauth'),
    grants: [
        'password',
        'refresh_token',
        'client_credentials'
    ],
    debug: app.get('env') === 'development',
    passthroughErrors: true
});

app.all('/oauth/token', app.oauth.grant());
app.use('/api', app.oauth.authorise(), require('./routes'));
app.use(express.static(publicFiles));
app.use(app.oauth.errorHandler());

// Handles Non-Grant OAuth2 Errors
app.use((err, req, res, next) => {
    if (err.name !== 'OAuth2Error') {
        next();
    }
    res.status(401);
    res.send({
        status: 'failure',
        code:   err.code,
        error:  err.message
    });
    debug(`${err.name} : ${err.message}`);
});

// Handles Error Pages
app.use((req, res, next) => {
    if (req.accepts('html') && /\/api\//.test(req.path) !== true) {
        return res.sendFile(path.join(publicFiles, '/index.html'));
    } else if (req.accepts('json')) {
        return res.status(404).json({ error: 'Not Found' });
    } else {
        return res.status(404).type('txt').send('Not Found');
    }
});

module.exports = app;
