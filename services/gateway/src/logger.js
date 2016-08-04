import winston, {Logger} from 'winston';
import {AMQP} from 'winston-amqp';
import config from './config';

winston.emitErrs = true;

const logger = new Logger({exitOnError: false});

logger.setLevels(winston.config.syslog.levels);
logger.add(winston.transports.Console, {
  timestamp: true,
  level: config.application.logLevel,
  handleExceptions: false,
  json: false,
  colorize: true
});

logger.add(AMQP, {
  name: 'gateway',
  level: config.application.logLevel,
  host: config.amqp.url,
  exchange: 'log',
  routingKey: 'gateway'
});

logger.stream = {
  write: message => logger.debug(message.replace(/\n$/, ''))
};

// logger.debug(config);

export default logger;