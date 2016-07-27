import goodly from 'goodly';
import pkg from '../package.json';
import worker from './service';

export default (async () => {
  const service = goodly({name: pkg.name});
  await service.start({brokerPath: process.env.AMQP_HOST || 'rabbitmq'});
  await service.on('time', worker);
})().catch(console.log);
