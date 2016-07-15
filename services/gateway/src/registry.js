import config from './config';
import { Router } from 'express';
import mongorito from 'mongorito';

/**
 * Connect to MongoDB
 */
mongorito.connect(config.mongodbHost);

let registry = new Router;

// Lists all services
registry.get('/', function(req, res, next) {
  res.send(process.env.HOSTNAME);
});

// Add a new service
registry.post('/', function (req, res, next) {
  next();
});

registry.patch('/', function (req, res, next) {
  next();
});

registry.put('/', function (req, res, next) {
  next();
});

registry.delete('/', function (req, res, next) {
  next();
});

export default registry;
