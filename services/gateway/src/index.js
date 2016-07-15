import logger from './logger';
import config from './config';
import registry from './registry';

import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import amqp from 'amqp';
import mongorito from 'mongorito';

logger.debug(config);

/**
 * Connect to RabittMQ
 */
const amqpConn = amqp.createConnection({
  url: config.amqpHost
});

/**
 * Setup Express HTTP Server
 */
let app = express();
app.server = http.createServer(app);

app.use(morgan('combined', { stream: logger.stream }));
app.use(cors({
  exposeHeader: ['Link']
}));
app.use(bodyParser.json({
  limit: '100kb'
}));

app.use('/', registry);

const port = process.env.GATEWAY_PORT || 3000;
app.listen(port, () => logger.info(`Listening on ${port}`));

export default app;
