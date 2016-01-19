'use strict';
const debug = require('debug')('overseer:test:character');
const { OAuthClient, OAuthAccessToken, OAuthRefreshToken } = require('../lib/models/oauth');
const User = require('../lib/models/user');
const Character = require('../lib/models/character');
const Skill = require('../lib/models/skill');
const ApiKey = require('../lib/models/apikey');

let app;
describe('EVE API', () => {

    before((done) => {
        co(function* () {
            app = yield server.connect();

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

                // Register new oauth client
                yield (new OAuthClient({
                    clientId:     oauth.clientId,
                    clientSecret: oauth.clientSecret,
                    redirectUri:  '/oauth/redirect'
                })).save();

                // Register new user
                let newUser = new User(user);
                newUser.set('password', user.password);
                yield newUser.save();

                // Login
                yield request(app).post('/oauth/token').type('form').send({
                    grant_type:    'password',
                    client_id:      oauth.clientId,
                    client_secret:  oauth.clientSecret,
                    username:       user.email,
                    password:       user.password
                }).then(res => {
                    oauth.token = res.body;
                });

                // Add an apikey
                yield request(app)
                    .post('/api/apikeys')
                    .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                    .send(apiKey);

                done();
            } catch (error) {
                debug(error);
                done(error);
            }
        });
    });

    describe('Characters', () => {
        var characterId = null;
        var skillCount = 0;

        before((done) => {
            co(function* () {

                try {
                    skillCount = yield Skill.count({ published : true });

                    request(app)
                        .get('/api/characters')
                        .set({ Authorization: `Bearer ${oauth.token.access_token}`})
                        .expect(200)
                        .end((err, res) => {
                            characterId = res.body[0].id;
                            done();
                        });
                } catch (err) {
                    done(err);
                }
            });
        });

        it('should be able to list all characters', (done) => {
            request(app)
                .get('/api/characters')
                .set({ Authorization: `Bearer ${oauth.token.access_token}`})
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);

                    let characters = res.body;
                    expect(characters).to.be.an('array');

                    let character = characters.pop();
                    expect(character).to.be.an('object');

                    character.should.have.property('id');
                    character.should.have.property('name');
                    character.should.have.property('picture');

                    done();
                });
        });

        it('should be able to get character info', (done) => {
            request(app)
                .get(`/api/characters/${characterId}`)
                .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);
                    let character = res.body;

                    expect(character).to.be.an('object');
                    expect(character).to.have.property('id');
                    expect(character).to.have.property('name');
                    expect(character).to.have.property('picture');
                    expect(character).to.have.property('birthdate');
                    expect(character).to.have.property('race');
                    expect(character).to.have.property('bloodline');
                    expect(character).to.have.property('ancestry');
                    expect(character).to.have.property('attributes');
                    expect(character).to.have.property('balance');
                    expect(character).to.have.property('gender');
                    expect(character).to.have.property('skills');

                    done();
                });
        });

        describe('Skills', () => {
            it('should be able to get learned skills for a character', (done) => {
                request(app)
                    .get(`/api/characters/${characterId}/skills`)
                    .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                    .expect(200)
                    .end((err, res) => {

                        let groups = res.body;
                        expect(groups).to.be.an('array');
                        expect(groups).not.to.have.length(0);

                        let group = groups.pop();
                        expect(group).to.be.an('object');

                        expect(group).to.have.property('id');
                        expect(group).to.have.property('name');
                        expect(group).to.have.property('skills');

                        let skills = group.skills;
                        expect(skills).to.be.an('array');
                        expect(skills).not.to.have.length(0);

                        let skill = skills.pop();
                        expect(skill).to.be.an('object');
                        expect(skill).to.have.property('id');
                        expect(skill).to.have.property('name');
                        expect(skill).to.have.property('description');
                        expect(skill).to.have.property('rank');
                        expect(skill).to.have.property('level');
                        expect(skill).to.have.property('points');

                        done();
                    });
            });

            it('should be able to get only queued skills for a character', (done) => {
                request(app)
                    .get(`/api/characters/${characterId}/skills/?filter=queued`)
                    .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                    .expect(200)
                    .end((err, res) => {

                        let groups = res.body;
                        expect(groups).to.be.an('array');

                        let group = groups.pop();
                        expect(group).to.be.an('object');

                        expect(group).to.have.property('id');
                        expect(group).to.have.property('name');
                        expect(group).to.have.property('skills');

                        let skills = group.skills;
                        expect(skills).to.be.an('array');
                        expect(skills).not.to.have.length(0);

                        let skill = skills.pop();
                        expect(skill).to.be.an('object');
                        expect(skill).to.have.property('id');
                        expect(skill).to.have.property('name');
                        expect(skill).to.have.property('description');
                        expect(skill).to.have.property('rank');
                        expect(skill).to.have.property('level');
                        expect(skill).to.have.property('points');
                        expect(skill).to.have.property('queued');

                        let queued = skill.queued;
                        expect(queued).to.be.an('array');

                        queued.map(job => {
                            expect(job).to.be.an('object');
                            expect(job).to.have.property('position');
                            expect(job).to.have.property('level');
                            expect(job).to.have.property('points');
                            expect(job).to.have.property('time');

                            let points = job.points;
                            expect(points).to.be.an('object');
                            expect(points).to.have.property('start');
                            expect(points).to.have.property('end');

                            let time = job.time;
                            expect(time).to.be.an('object');
                            expect(time).to.have.property('start');
                            expect(time).to.have.property('end');
                        });

                        done();
                    });
            });

            it('should be able to get every unknown skills for a character', (done) => {

                request(app)
                    .get(`/api/characters/${characterId}/skills/?filter=unknown`)
                    .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                    .expect(200)
                    .end((err, res) => {

                        let groups = res.body;
                        expect(groups).to.be.an('array');
                        expect(groups).not.to.have.length(0);

                        let group = groups.pop();
                        expect(group).to.be.an('object');
                        expect(group).to.have.property('id');
                        expect(group).to.have.property('name');
                        expect(group).to.have.property('skills');

                        let skills = group.skills;
                        expect(skills).to.be.an('array');
                        expect(skills).not.to.have.length(0);

                        skills.map(skill => {
                            expect(skill).to.be.an('object');
                            expect(skill).to.have.property('id');
                            expect(skill).to.have.property('name');
                            expect(skill).to.have.property('description');
                            expect(skill).to.have.property('rank');
                            expect(skill).to.have.property('level', null);
                            expect(skill).to.have.property('points', null);
                            expect(skill).to.have.property('queued', null);
                        });

                        done();
                    });
            });


            it('should be able to get every skills for a character', (done) => {
                request(app)
                    .get(`/api/characters/${characterId}/skills/?filter=all`)
                    .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                    .expect(200)
                    .end((err, res) => {
                        let groups = res.body;
                        expect(groups).to.be.an('array');
                        expect(groups).not.to.have.length(0);

                        let allSkilled = 0;
                        groups.map(group => {
                            expect(group).to.be.an('object');
                            expect(group).to.have.property('id');
                            expect(group).to.have.property('name');
                            expect(group).to.have.property('skills');

                            let skills = group.skills;
                            expect(skills).to.be.an('array');
                            expect(skills).not.to.have.length(0);

                            skills.map(skill => {
                                expect(skill).to.be.an('object');
                                expect(skill).to.have.property('id');
                                expect(skill).to.have.property('name');
                                expect(skill).to.have.property('description');
                                expect(skill).to.have.property('rank');
                                expect(skill).to.have.property('level');
                                expect(skill).to.have.property('points');
                                expect(skill).to.have.property('queued');
                                ++allSkilled;
                            });
                        });

                        expect(allSkilled).to.be.equal(skillCount);

                        done();
                    });

            });
        });

        describe('Accounts', () => {
            var account = null;

            it('should return a list of accounts', (done) => {
                request(app)
                    .get(`/api/characters/${characterId}/accounts`)
                    .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                    .expect(200)
                    .end((err, res) => {
                        should.not.exist(err);

                        res.body.should.be.an.array;
                        res.body[0].should.be.an.object;
                        account = res.body[0];

                        account.should.have.property('id');
                        account.should.have.property('key');
                        account.should.have.property('balance');

                        done();
                    });
            });

            it('should be able to get a log for an account', (done) => {
                request(app).get(`/api/characters/#{characterId}/accounts/${account.key}`)
                .set({ Authorization: `Bearer ${oauth.token.access_token}` })
                .expect(200)
                .end((err, res) => {
                    should.not.exist(err);

                    res.body.should.be.an.array;
                    res.body[0].should.be.an.object;

                    entry = res.body[0];

                    entry.should.have.property('account', account.key);
                    entry.should.have.property('date');
                    entry.should.have.property('reference');
                    entry.should.have.property('type');
                    entry.should.have.property('amount');
                    entry.should.have.property('balance');
                    entry.should.have.property('reason');

                    done();
                });
            });
        });
    });
});
