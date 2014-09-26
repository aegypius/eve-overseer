describe "EVE API", ->
  agent = supertest.agent "http://localhost:#{port}"

  describe "Characters", ->
    characterId = ""

    # Login
    before (done)->
      agent
        .post "/session"
        .send { email: user.email, password: user.password }
        .expect 200
        .end (err, res)->
          res.body.should.have.property._id
          user_id = res.body._id
          should.exist user_id

          # Add an api key
          agent
            .post "/api/users/#{user_id}/apikey"
            .send apiKey
            .expect 200
            .end (err, res)->
              should.not.exist err
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
