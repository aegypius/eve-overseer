import test from 'ava';
import timekeeper from 'timekeeper';
import moment from 'moment';
import service from '../src/service';

const expected = moment('2016-12-27T22:21:19+02:00');

test.before(() => {
  timekeeper.freeze(new Date(expected));
});

test('should return current time', async t => {
  await service({
    reply: ({time}) => {
      t.is(time, expected.format());
    }
  });
});

test('should return a formatted date', async t => {
  await service({
    data: {
      format: 'L'
    },
    reply: ({time}) => {
      t.is(time, expected.format('L'));
    }
  });
});

test('should return a localized date', async t => {
  await service({
    data: {
      format: 'LLLL',
      locale: 'fr'
    },
    reply: ({time}) => {
      t.is(time, expected.locale('fr').format('LLLL'));
    }
  });
});
