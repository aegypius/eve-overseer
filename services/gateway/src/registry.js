import {Router} from 'express';
import mongorito from 'mongorito';
import config from './config';

/**
 * Connect to MongoDB
 */
mongorito.connect(config.mongodbHost);

const registry = new Router();

// Lists all services
registry.get('/', (req, res) => {
  res.send(process.env.HOSTNAME);
});

// Add a new service
registry.post('/', (req, res, next) => {
  next();
});

registry.patch('/', (req, res, next) => {
  next();
});

registry.put('/', (req, res, next) => {
  next();
});

registry.delete('/', (req, res, next) => {
  next();
});

export default registry;
