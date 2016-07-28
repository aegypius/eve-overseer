import test from 'ava';
import service from '../src/service';

test('should be a function', t => {
  t.true(typeof service === 'function');
});
