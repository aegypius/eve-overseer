 # coffeelint: disable=max_line_length

{server} = require "../lib"

before (done)->
  server
    .then (http)->
      OAuthClient = mongoose.model "OAuthClients"
      ApiKey      = mongoose.model "ApiKey"

      OAuthClient.remove().exec()
        .then ->
          OAuthClient.create {
            clientId:     oauth.clientId
            clientSecret: oauth.clientSecret
            redirectUri:  '/oauth/redirect'
          }
        .then ->
          ApiKey.remove().exec()
            .then ->
              return http

    .then (http)->
      http.listen port, done

describe "Account", ->
  agent = request "http://localhost:#{port}"
  token = {}

  describe "Registration", ->
    it "should be able to get an access_token to register new users", (done)->
      agent
        .post "/oauth/token"
        .type "form"
        .send {
          grant_type:    "client_credentials"
          client_id:      oauth.clientId
          client_secret:  oauth.clientSecret
        }
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "token_type", "bearer"
          res.body.should.have.property "access_token"
          res.body.should.have.property "expires_in"
          res.body.should.have.property "refresh_token"
          token = res.body
          done()

    it "should be able to register new users", (done)->

      account = {
        email:    user.email
        username: casual.username
        password: "test"
      }

      agent
        .post "/api/account"
        .set Authorization: "Bearer #{token.access_token}"
        .send account
        .expect 201, ""
        .end (err, res)->
          should.not.exist err
          done()

    it "should not be able to use an existing email while registering", (done)->

      account = {
        email:    user.email
        username: casual.username
        password: "123456789"
      }

      agent
        .post "/api/account"
        .set Authorization: "Bearer #{token.access_token}"
        .send account
        .expect 400
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "name", "ValidationError"
          should.exist res.body.errors.email
          res.body.errors.email.should.have.property "message", "An account already exist for this email"

          done()

  describe "Login / Logout", ->
    it "should be able to login with valid username and password", (done)->

      agent
        .post "/oauth/token"
        .type "form"
        .send {
          grant_type:    "password"
          client_id:      oauth.clientId
          client_secret:  oauth.clientSecret
          username:       user.email
          password:       "test"
        }
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.have.property "token_type", "bearer"
          res.body.should.have.property "access_token"
          res.body.should.have.property "expires_in"
          res.body.should.have.property "refresh_token"
          token = res.body
          done()

  describe "Profile", ->

    it "should be able to get current user card", (done)->
      agent
        .get "/api/account"
        .set Authorization: "Bearer #{token.access_token}"
        .expect 200
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "email",   user.email.toLowerCase()
          res.body.should.have.property "username"
          res.body.should.have.property "avatar"
          res.body.should.have.property "apikeys"
          res.body.apikeys.should.be.an.array

          done()

    it "should be able to update its username", (done)->

      agent
        .put "/api/account"
        .set Authorization: "Bearer #{token.access_token}"
        .send { username: user.username }
        .expect 202, ""
        .end (err, res)->
          should.not.exist err
          done()

    it "should be able to update its password", (done)->
      agent
        .put "/api/account"
        .set Authorization: "Bearer #{token.access_token}"
        .send { password: user.password }
        .expect 202, ""
        .end (err, res)->
          should.not.exist err
          done()

    it "should not be able to update its email", (done)->
      agent
        .put "/api/account"
        .set Authorization: "Bearer #{token.access_token}"
        .send { email: casual.email }
        .expect 400
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "name", "ValidationError"

          should.exist res.body.errors.email.message
          res.body.errors.email.should.have.property "message", "Email is read-only"

          done()

  describe "API Key Management", ->

    it "should be able to add a new apikey", (done)->
      agent
        .post "/api/apikeys"
        .set Authorization: "Bearer #{token.access_token}"
        .send apiKey
        .expect 201, ""
        .end (err, res)->
          should.not.exist err
          done()

    it "should throw an error if the same apikey allready exists", (done)->
      agent
        .post "/api/apikeys"
        .set Authorization: "Bearer #{token.access_token}"
        .send apiKey
        .expect 400
        .end (err, res)->
          should.not.exist err

          res.body.should.have.property "name", "ValidationError"
          should.exist res.body.errors.keyId
          res.body.errors.keyId.should.have.property "message", "This ApiKey is already registered"

          done()


    it "should be able to list apikeys", (done)->
      agent
        .get "/api/apikeys"
        .set Authorization: "Bearer #{token.access_token}"
        .expect 200
        .end (err, res)->
          should.not.exist err
          res.body.should.be.an.array
          res.body.should.have.length 1

          apikey = res.body[0]

          apikey.should.have.property "keyId",            apiKey.keyId
          apikey.should.have.property "verificationCode", apikey.verificationCode
          apikey.should.have.property "expires"
          apikey.should.have.property "accessMask"

          apikey.should.have.property "characters"
          apikey.characters.should.be.a.number

          done()

    it "should be able to get details of an apikey", (done)->
      agent
        .get "/api/apikeys/#{apiKey.keyId}"
        .set Authorization: "Bearer #{token.access_token}"
        .expect 200
        .end (err, res)->
          should.not.exist err

          res.body.should.be.an.object
          apikey = res.body

          apikey.should.have.property "keyId",            apiKey.keyId
          apikey.should.have.property "verificationCode", apikey.verificationCode
          apikey.should.have.property "expires"
          apikey.should.have.property "accessMask"

          apikey.should.have.property "characters"
          apikey.characters.should.be.an.array

          apikey.should.have.property "account"
          apikey.account.should.be.an.object
          apikey.account.should.have.property "logonMinutes"
          apikey.account.should.have.property "logonCount"
          apikey.account.should.have.property "paidUntil"

          done()

    it "should be able to delete an apikey", (done)->
      agent
        .delete "/api/apikeys/#{apiKey.keyId}"
        .set Authorization: "Bearer #{token.access_token}"
        .expect 200, ""
        .end (err, res)->
          should.not.exist err
          done()
