import amqp from 'amqp';
import pkg from '../package.json';
import config from './config';
import logger from './logger';

const register = ({name, description, version, endpoints, process}) => {
  /**
   * Connect to RabittMQ
   */
  const connection = amqp.createConnection({
    url: config.amqpHost
  });

  connection.on('error', e => {
    logger.crit('Error connecting to backend: ', e);
  });

  connection.on('ready', () => {
    connection.queue('service-registration', q => {
      logger.info(`Queue "${q.name}" is open`);
    });
  });
};

export default register({
  name: pkg.name,
  description: pkg.description,
  version: pkg.version,
  endpoints: [
    'time'
  ],
  process: function () {
    const now = new Date();
    return now.toIsoString();
  }
});
