import pkg from '../package.json';
const env = process.env.NODE_ENV || 'development';
const logLevel = process.env.GATEWAY_LOG_LEVEL || 'debug';
const amqpHost = process.env.AMQP_HOST         || 'amqp://rabbitmq'
const mongodbHost = process.env.MONGODB_HOST   || 'mongo://mongo/eve-overseer'

export default {
  env,
  amqpHost,
  logLevel,
  mongodbHost
};
