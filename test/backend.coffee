 # coffeelint: disable=max_line_length

{server} = require "../lib"
port     = process.env.PORT || 3333

before (done)->
  server
    .then (api)->
      api.listen port, done

describe "Account Management", ->
  agent = supertest.agent "http://localhost:#{port}"

  describe "User Registration", ->

    it "should be able to register new users", (done)->

      account = {
        email:    user.email
        username: faker.Internet.userName()
        password: "test"
      }

      agent
        .post "/api/users"
        .send account
        .expect 200
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "email",    account.email.toLowerCase()
          res.body.should.have.property "username", account.username
          res.body.should.have.property "avatar"

          done()

    it "should throw an error when registering a user with a duplicate email", (done)->

      account = {
        email:    user.email
        username: faker.Internet.userName()
        password: "123456789"
      }

      agent
        .post "/api/users"
        .send account
        .expect 400
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "name", "ValidationError"
          done()


  describe "Session Management", ->

    it "should be able to logout", (done)->

      agent
        .delete "/session"
        .expect 200, ""
        .end (err, res)->
          should.not.exist err
          done()

    it "should return 401 if user is not authorized", (done)->

      agent
        .get "/session"
        .expect 401
        .end (err, res)->
          should.not.exist err
          done()

    it "should be able to login with valid credentials", (done)->

      agent
        .post "/session"
        .send {
          email:    user.email
          password: "test"
        }
        .expect 200
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "username"
          res.body.should.have.property "email", user.email.toLowerCase()
          res.body.should.have.property "avatar"

          done()

    it "should be able to get current user info", (done)->
      agent
        .get "/session"
        .expect 200
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "_id"
          res.body.should.have.property "email",   user.email.toLowerCase()
          res.body.should.have.property "username"
          res.body.should.have.property "avatar"

          done()

  describe "User Update", ->
    user_id=null

    before (done)->
      agent
        .get "/session"
        .end (err, res)->
          user_id = res.body._id
          done()

    it "should be able to update its username", (done)->

      agent
        .put "/api/users/#{user_id}"
        .send { username: user.username }
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "username", user.username
          done()

    it "should be able to update its password", (done)->
      agent
        .put "/api/users/#{user_id}"
        .send { password: user.password }
        .expect 200
        .end (err, res)->
          should.not.exist err

          agent
            .post "/session"
            .send { email: "test@example.com", password: "new-password" }
            .expect 200
            .end (res, req)->
              should.not.exist err
              done()

    it "should not be able to update its email", (done)->
      agent
        .put "/api/users/#{user_id}"
        .send { email: faker.Internet.email() }
        .expect 400
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "message", "Email is read-only"
          done()

  describe "API Key Management", ->
    user_id=null
    before (done)->
      agent
        .get "/session"
        .end (err, res)->
          user_id = res.body._id
          user_id.should.not.be.undefined
          done()

    it "should be able to add a new apikey", (done)->
      agent
        .post "/api/users/#{user_id}/apikey"
        .send {
          keyId:            process.env.TEST_EVEONLINE_API_ID
          verificationCode: process.env.TEST_EVEONLINE_VERIFICATION_CODE
        }
        .expect 200, ""
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "_id"
          res.body.should.have.property "_user"
          res.body.should.have.property "keyId",            process.env.TEST_EVEONLINE_API_ID
          res.body.should.have.property "verificationCode", process.env.TEST_EVEONLINE_VERIFICATION_CODE

          done()

    it "should throw an error id the same apikey allready exists for user", (done)->
      agent
        .post "/api/users/#{user_id}/apikey"
        .send {
          keyId:            process.env.TEST_EVEONLINE_API_ID
          verificationCode: process.env.TEST_EVEONLINE_VERIFICATION_CODE
        }
        .expect 400
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "message", "Validation failed"
          done()


    it "should be able to list apikeys", (done)->
      agent
        .get "/api/users/#{user_id}/apikey"
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.length 1
          done()

    it "should be able to delete an apikey", (done)->
      agent
        .get "/api/users/#{user_id}/apikey"
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.length 1
          apikey = res.body[0]

          agent
            .delete "/api/users/#{user_id}/apikey/#{apikey._id}"
            .expect 200
            .end (err, res)->
              should.not.exist err
              done()

describe "EVE API", ->
  agent = supertest.agent "http://localhost:#{port}"

  describe "Characters", ->
    characterId = ""

    # Login
    before (done)->
      agent
        .post "/session"
        .send { email: email, password: "new-password" }
        .expect 200
        .end (err, res)->
          res.body.should.have.property._id
          user_id = res.body._id
          expect(user_id).not.undefined

          # Add an api key
          agent
            .post "/api/users/#{user_id}/apikey"
            .send {
              keyId:            process.env.TEST_EVEONLINE_API_ID
              verificationCode: process.env.TEST_EVEONLINE_VERIFICATION_CODE
            }
            .expect 200
            .end (err, res)->
              done()

    it "should be able to list all characters", (done)->
      agent
        .get "/api/characters"
        .expect 200
        .end (err, res)->
          should.not.exist err

          res.body.should.be.an.array

          res.body[0].should.have.property "id"
          characterId = res.body[0].id

          res.body[0].should.have.property "name"
          res.body[0].should.have.property "picture"

          done()

    it "should be able to get character info", (done)->
      agent
        .get "/api/characters/#{characterId}"
        .expect 200
        .end (err, res)->
          should.not.exist err
          # console.log characterId, res.body
          res.body.should.be.an.object

          res.body.should.have.property "id"
          res.body.should.have.property "name"
          res.body.should.have.property "picture"
          res.body.should.have.property "birthdate"
          res.body.should.have.property "race"
          res.body.should.have.property "bloodline"
          res.body.should.have.property "ancestry"
          res.body.should.have.property "clone"
          res.body.should.have.property "attributes"
          res.body.should.have.property "balance"
          res.body.should.have.property "gender"

          done()

    describe "Skills", ->

      it "should be able to get learned skills for a character", (done)->

        agent
          .get "/api/characters/#{characterId}/skills"
          .expect 200
          .end (err, res)->
            should.not.exist err

            res.body.should.be.an.array

            res.body[0].should.be.an.object
            group = res.body[0]

            group.should.have.property "id"
            group.should.have.property "name"
            group.should.have.property "skills"

            group.skills.should.be.an.array
            skill = group.skills[0]

            skill.should.be.an.object
            skill.should.have.property "id"
            skill.should.have.property "name"
            skill.should.have.property "description"
            skill.should.have.property "rank"
            skill.should.have.property "level"
            skill.should.have.property "points"

            done()
