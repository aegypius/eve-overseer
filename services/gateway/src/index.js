import 'babel-polyfill';
import http from 'http';
import express, {Router} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import compression from 'compression';
import goodly from 'goodly';
import logger from './logger';
import config from './config';

/**
 * Setup Express HTTP Server
 */
const app = express();
app.server = http.createServer(app);
app.logger = logger;

app.disable('x-powered-by');
app.use(morgan('combined', {stream: logger.stream}));
app.use(cors({
  exposeHeader: [
    'Link'
  ]
}));
app.use(bodyParser.json({
  limit: '100kb'
}));
app.use(compression());

(async () => {
  const service = goodly({name: 'gateway'});
  await service.start({brokerPath: config.amqp.host});

  // Declare express router
  const api = new Router();
  app.use('/api', api);

  // Await registy to declare routes
  const registry = await service.request('registry');

  registry.on('register', ({data}) => {
    console.log(data);
  });

  api.get('/time', async (req, res, next) => {
    try {
      const response = await service.request('time', req.body);
      res.send(response);
    } catch (err) {
      console.log(err);
      next(err);
    }
  });
})().catch(console.log);

const port = process.env.GATEWAY_PORT || 3000;
app.listen(port, () => logger.info(`Listening on ${port}`));

export default app;
