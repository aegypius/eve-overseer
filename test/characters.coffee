describe "EVE API", ->
  agent = request "http://localhost:#{port}"

  before (done)->
    agent
      .post "/api/apikeys"
      .set Authorization: "Bearer #{oauth.token.access_token}"
      .send apiKey
      .end (err, res)->
        should.not.exist err
        done()


  describe "Characters", ->
    characterId = null
    it "should be able to list all characters", (done)->
      agent
        .get "/api/characters"
        .set Authorization: "Bearer #{oauth.token.access_token}"
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
        .set Authorization: "Bearer #{oauth.token.access_token}"
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
          .set Authorization: "Bearer #{oauth.token.access_token}"
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

    describe "Accounts", ->
      account = null

      it "should return a list of accounts", (done)->

        agent
          .get "/api/characters/#{characterId}/accounts"
          .set Authorization: "Bearer #{oauth.token.access_token}"
          .expect 200
          .end (err, res)->
            should.not.exist err

            res.body.should.be.an.array
            res.body[0].should.be.an.object

            account = res.body[0]

            account.should.have.property "id"
            account.should.have.property "key"
            account.should.have.property "balance"

            done()

      it "should be able to get a log for an account", (done)->

        agent
          .get "/api/characters/#{characterId}/accounts/#{account.key}"
          .set Authorization: "Bearer #{oauth.token.access_token}"
          .expect 200
          .end (err, res)->
            should.not.exist err

            res.body.should.be.an.array
            res.body[0].should.be.an.object

            entry = res.body[0]

            entry.should.have.property "account", account.key
            entry.should.have.property "date"
            entry.should.have.property "reference"
            entry.should.have.property "type"
            entry.should.have.property "amount"
            entry.should.have.property "balance"
            entry.should.have.property "reason"

            done()
