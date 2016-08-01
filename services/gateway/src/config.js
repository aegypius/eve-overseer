import {name, description} from '../package.json';

const env = process.env.NODE_ENV || 'development';
const logLevel = process.env.GATEWAY_LOG_LEVEL || 'debug';
const amqpHost = process.env.AMQP_HOST || 'rabbitmq';
const redisHost = process.env.REDIS_HOST || 'redis';
const mongoHost = process.env.MONGODB_HOST || 'mongo';
const mongoDatabase = process.env.MONGODB_DATABASE || `eve-overseer-${env}`;

export default {
  application: {
    name,
    description,
    env,
    logLevel
  },
  amqp: {
    host: amqpHost,
    url: `amqp://${amqpHost}`
  },
  redis: {
    host: redisHost,
    url: `redis://${redisHost}`
  },
  mongo: {
    host: mongoHost,
    database: mongoDatabase,
    url: `mongodb://${mongoHost}/${mongoDatabase}`
  }
};
