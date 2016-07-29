import test from 'ava';
import pkg from '../package.json';
import validate from '../src/service/validate';

test('should export a function', t => {
  t.true(typeof validate === 'function');
});

test('should throw error if argument is empty', t => {
  t.throws(validate());
});

test('should validate ', async t => {
  const result = await validate({
    service: pkg.name,
    version: pkg.version,
    routes: {
      'hello-world': {
        pattern: '/hello/:name'
      },
      'another-route': {
        pattern: '/other/route',
        methods: ['POST', 'DELETE']
      }
    }
  });

  t.true(result);
});
