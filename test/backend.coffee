 # coffeelint: disable=max_line_length

should    = (require "chai").should()
assert    = require "assert"
supertest = require "supertest"
mongoose  = require "mongoose"

app      = require "../lib"

describe "Account Management", ->
  agent = supertest.agent(app)

  before (done)->
    if process.env.NODE_ENV is "test"
      mongoose.connection.on "open", (ref)->
        mongoose.connection.db.dropDatabase (err)->
          throw err if err
          done()
    else
      done()

  it "should return 401 if user is not authorized", (done)->

    agent
      .get "/session"
      .expect 401
      .end (err, res)->
        should.not.exist err
        done()


  it "should be able to register new users", (done)->

    user = {
      email:    "test@example.com"
      username: "John Doe"
      password: "test"
    }

    agent
      .post "/user"
      .send user
      .expect 200
      .end (err, res)->
        should.not.exist err
        done()

  it "should throw an error when registering a user with a duplicate email", (done)->

    user = {
      email:    "test@example.com"
      username: "Jane Doe"
      password: "test2"
    }

    agent
      .post "/user"
      .send user
      .expect 400
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
      .get '/session'
      .expect 200
      .end (err, res)->
        should.not.exist err
        res.body.should.have.property "_id"
        res.body.should.have.property "email",    "test@example.com"
        res.body.should.have.property "username", "John Doe"
        done()
