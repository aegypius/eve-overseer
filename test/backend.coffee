 # coffeelint: disable=max_line_length

should    = (require "chai").should()
assert    = require "assert"
supertest = require "supertest"
mongoose  = require "mongoose"

app      = require "../lib"

agent = supertest.agent(app)

describe "Account Management", ->

  before (done)->
    if process.env.NODE_ENV is "test"
      mongoose.connection.on "open", (ref)->
        mongoose.connection.db.dropDatabase (err)->
          throw err if err
          done()
    else
      done()

  describe "User Registration", ->

    it "should be able to register new users", (done)->

      user = {
        email:    "test@example.com"
        username: "John Doe"
        password: "test"
      }

      agent
        .post "/api/users"
        .send user
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "email", user.email
          res.body.should.have.property "username", user.username
          done()

    it "should throw an error when registering a user with a duplicate email", (done)->

      user = {
        email:    "test@example.com"
        username: "Jane Doe"
        password: "test2"
      }

      agent
        .post "/api/users"
        .send user
        .expect 400
        .end (err, res)->
          should.not.exist err
          done()


  describe "Session Management", ->

    it "should be able to logout", (done)->

      agent
        .delete "/session"
        .expect 200
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
      user = {
        email: "test@example.com"
        password: "test"
      }

      agent
        .post "/session"
        .send user
        .expect 200
        .end (err, res)->
          should.not.exist err
          done()

    it "should be able to get current user info", (done)->
      agent
        .get "/session"
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "_id"
          res.body.should.have.property "email",    "test@example.com"
          res.body.should.have.property "username", "John Doe"
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
        .send { username: "John F. Doe" }
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "username", "John F. Doe"
          done()

    it "should be able to update its password", (done)->
      agent
        .put "/api/users/#{user_id}"
        .send { password: "new-password" }
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
        .send { email: "test2@example.com" }
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
          done()

    it "should be able to add a new apikey", (done)->
      agent
        .post "/api/users/#{user_id}/apikey"
        .send {
          keyId:            process.env.TEST_EVEONLINE_API_ID
          verificationCode: process.env.TEST_EVEONLINE_VERIFICATION_CODE
        }
        .expect 200
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
  agent = supertest.agent(app)

  describe "Characters", ->
    characterId = ""

    # Login
    before (done)->
      agent
        .get "/session"
        .expect 200
        .end (err, res)->
          res.body.should.have.property._id
          user_id = res.body._id

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

      it "should be able to get skills for a character", (done)->

        agent
          .get "/api/character/#{characterId}/skills"
          .expect 200
          .end (err, res)->
            should.not.exist err

            res.body.should.be.an.array

            res.body[0].should.be.an.object
            skill = res.body[0]

            skill.should.have.property "id"
            skill.should.have.property "name"
            skill.should.have.property "description"
            skill.should.have.property "group"
            skill.should.have.property "level"
            skill.should.have.property "points"

            done()
