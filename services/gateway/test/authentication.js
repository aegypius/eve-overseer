import casual from 'casual';
import test from 'ava';
import jwt from 'jsonwebtoken';
import request from 'supertest-as-promised';
import {app} from './bootstrap';

const agent = request(app);
const user = {
  email: casual.email,
  password: 'password'
};

test.serial('should be able to register', async () => {
  await agent.post('/register')
    .send(user)
    .expect(201)
  ;
});

test('should not be able to register with existing email', async () => {
  await agent.post('/register')
    .send({
      email: user.email,
      password: 'another password'
    })
    .expect(409)
  ;
});

test('should be able to login', async t => {
  try {
    await agent.post('/login')
      .send(user)
      .expect(200)
      .then(res => {
        jwt.verify(res.text, 'super secret jwt key');
        t.pass();
      })
    ;
  } catch (err) {
    t.fail();
  }
});
