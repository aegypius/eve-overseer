import test from 'ava';
import mockery from 'mockery';
import register from '../src/service/register';

test.before(() => {
  mockery.enable();
  mockery.registerMock('mongodb', {
    connect: () => {
      console.log('here');
    }
  });
});

test('should export a function', t => {
  t.true(typeof register === 'function');
});

test('should be able to save service into database', async t => {
  await register({
    data: {
      service: 'sample-service',
      version: '1.0.0'
    }
  });

  t.pass();
});
