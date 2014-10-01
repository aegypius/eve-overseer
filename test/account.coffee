 # coffeelint: disable=max_line_length

{server} = require "../lib"
before (done)->
  server
    .then (api)->
      api.listen port, done

describe "Account", ->
  agent = supertest.agent "http://localhost:#{port}"
  describe "Registration", ->
    it "should be able to register new users", (done)->

      account = {
        email:    user.email
        username: casual.username
        password: "test"
      }

      agent
        .post "/api/account"
        .send account
        .expect 200
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "email",    account.email.toLowerCase()
          res.body.should.have.property "username", account.username
          res.body.should.have.property "avatar"

          done()

    it "should not be able to use an existing email while registering", (done)->

      account = {
        email:    user.email
        username: casual.username
        password: "123456789"
      }

      agent
        .post "/api/account"
        .send account
        .expect 400
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "name", "ValidationError"
          should.exist res.body.errors.email
          res.body.errors.email.should.have.property "message", "An account allready exist for this email"

          done()

  describe "Login / Logout", ->
    it "should be able to login with valid username and password", (done)->

      agent
        .post "/api/authorize"
        .send {
          email:    user.email
          password: "test"
        }
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "username"
          res.body.should.have.property "token"
          res.body.should.have.property "email", user.email.toLowerCase()
          res.body.should.have.property "avatar"

          done()

    it "should be able to logout", (done)->

      agent
        .delete "/api/authorize"
        .expect 200, ""
        .end (err, res)->
          should.not.exist err
          done()

      it "should return 401 if user is not authorized", (done)->

        agent
          .get "/api/account"
          .expect 401, ""
          .end (err, res)->
            should.not.exist err
            done()

  describe "Profile", ->

    it "should be able to get current user card", (done)->
      agent
        .get "/api/account"
        .expect 200
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "email",   user.email.toLowerCase()
          res.body.should.have.property "username"
          res.body.should.have.property "avatar"

          done()

    it "should be able to update its username", (done)->

      agent
        .put "/api/account"
        .send { username: user.username }
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "username", user.username
          done()

    it "should be able to update its password", (done)->
      agent
        .put "/api/account"
        .send { password: user.password }
        .expect 200
        .end (err, res)->
          should.not.exist err

          agent
            .post "/api/authorize"
            .send { email: "test@example.com", password: "new-password" }
            .expect 200
            .end (res, req)->
              should.not.exist err
              done()

    it "should not be able to update its email", (done)->
      agent
        .put "/api/account"
        .send { email: casual.email }
        .expect 400
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "message", "Email is read-only"
          done()

  describe "API Key Management", ->
    user_id=null
    before (done)->
      agent
        .get "/api/authorize"
        .end (err, res)->
          user_id = res.body._id
          user_id.should.not.be.undefined

          # Drop api key if allready exists in database
          ApiKey = mongoose.model('ApiKey')
          ApiKey.remove { keyId: apiKey.keyId }, ->
            done()

    it "should be able to add a new apikey", (done)->
      agent
        .post "/api/account/apikey"
        .send apiKey
        .expect 200
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "_id"
          res.body.should.have.property "_user"
          res.body.should.have.property "keyId",            apiKey.keyId
          res.body.should.have.property "verificationCode", apiKey.verificationCode

          done()

    it "should throw an error if the same apikey allready exists", (done)->
      agent
        .post "/api/account/apikey"
        .send apiKey
        .expect 400
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "message", "Validation failed"
          done()


    it "should be able to list apikeys", (done)->
      agent
        .get "/api/account/apikey"
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.length 1
          done()

    it "should be able to delete an apikey", (done)->
      agent
        .get "/api/account/apikey"
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.length 1
          apikey = res.body[0]

          agent
            .delete "/api/account/apikey/#{apikey._id}"
            .expect 200
            .end (err, res)->
              should.not.exist err
              done()
