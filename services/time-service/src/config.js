const env = process.env.NODE_ENV || 'development';
const logLevel = process.env.GATEWAY_LOG_LEVEL || 'debug';
const amqpHost = process.env.AMQP_HOST || 'amqp://rabbitmq';

export default {
  env,
  amqpHost,
  logLevel
};
