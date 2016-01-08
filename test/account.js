'use strict';
const { OAuthClient, OAuthAccessToken, OAuthRefreshToken } = require('../lib/models/oauth');
const Character = require('../lib/models/character');
const ApiKey = require('../lib/models/apikey');
const User = require('../lib/models/user');
let app;

before((done) => {
    co(function* () {

        app = yield server.connect();

        yield [
            function* () {
                try {
                    // Remove all data
                    yield [
                        OAuthClient.remove(),
                        OAuthAccessToken.remove(),
                        OAuthRefreshToken.remove(),
                        User.remove(),
                        Character.remove(),
                        ApiKey.remove()
                    ];

                    // Create a new client for testing purpose
                    let client = new OAuthClient({
                        clientId:     oauth.clientId,
                        clientSecret: oauth.clientSecret,
                        redirectUri:  '/oauth/redirect'
                    });

                    yield client.save();

                } catch (err) {
                    console.error(err);
                }
            }
        ];

        done();
    });
});

describe('Account', () => {

    describe('Registration', () => {
        it('should be able to get an access_token to register new users', (done) => {
            request(app).post('/oauth/token')
                .type('form')
                .send({
                    grant_type:    'client_credentials',
                    client_id:      oauth.clientId,
                    client_secret:  oauth.clientSecret
                })
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    should.exist(res);

                    res.body.should.have.property('token_type', 'bearer');
                    res.body.should.have.property('access_token');
                    res.body.should.have.property('expires_in');
                    res.body.should.have.property('refresh_token');
                    oauth.token = res.body;
                    done();
                });
        });

        it('should be able to register new users', (done)=> {
            let account = {
                email:    user.email,
                username: casual.username,
                password: 'test'
            };

            request(app).post('/api/account')
                .set({Authorization: `Bearer ${oauth.token.access_token}` })
                .send(account)
                .expect(201, '')
                .end( (err, res) => {
                    should.not.exist(err);
                    done();
                });
        });

        it('should not be able to use an existing email while registering', (done) => {
            let account = {
                email:    user.email,
                username: casual.username,
                password: '123456789'
            };

            request(app).post('/api/account')
                .set({Authorization: `Bearer ${oauth.token.access_token}`})
                .send(account)
                .expect(400)
                .end((err, res)=> {
                    should.not.exist(err);

                    let errors = res.body;

                    errors.should.be.an('array');

                    errors.should.have.length(1);

                    let error = errors.pop();

                    error.should.have.property('name', 'ValidationError');
                    error.should.have.property('property', 'email');
                    error.should.have.property('message', 'An account already exist for this email');

                    done();
                });
        });
    });

    describe('Login / Logout', () => {
        it('should be able to login with valid username and password', (done) => {
            request(app).post('/oauth/token').type('form').send({
                grant_type:    'password',
                client_id:      oauth.clientId,
                client_secret:  oauth.clientSecret,
                username:       user.email,
                password:       'test'
            })
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
                res.body.should.have.property('token_type', 'bearer');
                res.body.should.have.property('access_token');
                res.body.should.have.property('expires_in');
                res.body.should.have.property('refresh_token');
                oauth.token = res.body;
                done();
            });
        });

        it('should fail when invalid username is submitted', (done) => {
            request(app).post('/oauth/token').type('form').send({
                grant_type:    'password',
                client_id:      oauth.clientId,
                client_secret:  oauth.clientSecret,
                username:       'invalid username',
                password:       'test'
            }).expect(401).end(done);
        });

        it('should fail when invalid password is submitted', (done) => {
            request(app).post('/oauth/token').type('form').send({
                grant_type:    'password',
                client_id:      oauth.clientId,
                client_secret:  oauth.clientSecret,
                username:       user.email,
                password:       'invalid password'
            }).expect(401).end(done);
        });
    });

    describe('Profile', () => {
        it('should be able to get current user card', (done) => {
            request(app).get('/api/account')
                .set({Authorization: `Bearer ${oauth.token.access_token}`})
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);

                    let userCard = res.body;

                    userCard.should.have.property('email');
                    userCard.should.have.property('username');
                    userCard.should.have.property('avatar');
                    userCard.should.not.have.property('password');
                    userCard.should.not.have.property('salt');

                    done();
                });
        });

        it('should be able to update its username', (done) => {
            request(app).put('/api/account')
                .set({Authorization: `Bearer ${oauth.token.access_token}`})
                .send({ username: user.username })
                .expect(202)
                .end(done);
        });

        it('should be able to update its password', (done) => {
            request(app).put('/api/account')
                .set({Authorization: `Bearer ${oauth.token.access_token}`})
                .send({ password: user.password })
                .expect(202, '')
                .end((err, res) => {
                    should.not.exist(err);
                    done();

                });
        });

        it('should not be able to update its email', (done) => {
            request(app).put('/api/account')
                .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                .send({ email: casual.email })
                .expect(400)
                .end((err, res) => {
                    should.not.exist(err);

                    let errors = res.body;
                    errors.should.be.an('array');
                    errors.should.have.length(1);
                    let error = errors.pop();

                    error.should.have.property('name', 'ValidationError');
                    error.should.have.property('property', 'email');
                    error.should.have.property('message', 'Email is read-only');

                    done();
                });
        });
    });

    describe('API Key Management', () => {
        it('should be able to add a new apikey', (done) => {
            request(app).post('/api/apikeys')
                .set({Authorization: `Bearer ${oauth.token.access_token}`})
                .send(apiKey)
                .expect(201, '')
                .end((err, res) => {
                    should.not.exist(err);
                    done();
                });
        });


        it('should throw an error if the same apikey allready exists', (done) => {
            request(app).post('/api/apikeys')
            .set({Authorization: `Bearer ${oauth.token.access_token}`})
            .send(apiKey)
            .expect(400)
            .end((err, res) => {
                should.not.exist(err);

                let errors = res.body;
                errors.should.be.an('array');
                errors.should.have.length(1);
                let error = errors.pop();

                error.should.have.property('name', 'ValidationError');
                error.should.not.have.property('property');
                error.should.have.property('message', 'This ApiKey is already registered');

                done();
            });
        });

        it('should be able to list apikeys', (done) => {
            request(app).get('/api/apikeys')
                .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);

                    let apikeys = res.body;
                    apikeys.should.be.an('array');
                    apikeys.should.have.length(1);

                    apikeys.forEach((apikey) => {
                        apikey.should.have.property('keyId', apiKey.keyId);
                        apikey.should.have.property('verificationCode', apikey.verificationCode);
                        apikey.should.have.property('expires');
                        apikey.should.have.property('accessMask');
                        apikey.should.have.property('characters');
                        apikey.characters.should.be.a('number');
                    });

                    done();
                });
        });

        it('should be able to get details of an apikey', (done) => {
            request(app).get(`/api/apikeys/${apiKey.keyId}`)
                .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);

                    let apikey = res.body;
                    apikey.should.be.an('object');

                    apikey.should.have.property('keyId',            apiKey.keyId);
                    apikey.should.have.property('verificationCode', apikey.verificationCode);
                    apikey.should.have.property('expires');
                    apikey.should.have.property('accessMask');

                    apikey.should.have.property('characters');
                    apikey.characters.should.be.an('array');

                    apikey.characters.forEach((character) => {
                        character.should.be.an('object');
                    });

                    apikey.should.have.property('account');
                    apikey.account.should.be.an('object');
                    apikey.account.should.have.property('logonMinutes');
                    apikey.account.should.have.property('logonCount');
                    apikey.account.should.have.property('paidUntil');

                    done();
                });
        });

        it('should be able to delete an apikey', (done) => {
            request(app).delete(`/api/apikeys/${apiKey.keyId}`)
                .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    done();
                });
        });

        it('should not remain some orphaned characters', (done) => {
            co(function* () {
                return yield Character.populate('apikey', ApiKey).find();
            }).then((characters) => {
                characters.should.be.an('array');
                characters.should.have.length(0);
                done();
            }).catch((error) => {
                done(error);
            });
        });
    });
});
