import goodly from 'goodly';
import Mongorito from 'mongorito';
import {register, unregister} from './service/register';

export default (async () => {
  const service = goodly({name: 'registry'});

  // Start service
  await service.start({brokerPath: process.env.AMQP_HOST || 'rabbitmq'});

  service.on('add service', register);
  service.on('remove service', unregister);
})().catch(console.log);
