mongoose        = require "mongoose"
{Schema}        = mongoose
Timestampable   = require "mongoose-timestamp"
UniqueValidator = require "mongoose-unique-validator"
Q               = require "q"

AttributeType  = {
  value: Number
  enhancer: {
    name: String
    value: Number
  }
}


CharacterSchema  = new Schema {
  id: {
    type:     String
    unique:   true
    required: true
  }
  name:      String
  birthdate: Date
  race:      String
  bloodline: String
  ancestry:  String
  gender:    String
  balance:   Number
  corporation: {
    id: Number
    name: String
  }
  alliance: {
    id: Number
    name: String
  }
  faction: {
    id: Number
    name: String
  }
  clone: {
    name:        String
    skillPoints: Number
  }
  attributes: {
    intelligence: AttributeType
    memory:       AttributeType
    charisma:     AttributeType
    perception:   AttributeType
    willpower:    AttributeType
  }
  apikey:    {
    type: Schema.ObjectId
    ref:  "ApiKey"
  }
}, {
  toJSON : {
    virtuals: true
  }
}

CharacterSchema.plugin Timestampable
CharacterSchema.plugin UniqueValidator

CharacterSchema
  .virtual "picture"
  .get ()->
    poster:  "http://image.eveonline.com/Character/#{@id}_1024.jpg"
    xlarge:  "http://image.eveonline.com/Character/#{@id}_512.jpg"
    large:   "http://image.eveonline.com/Character/#{@id}_256.jpg"
    medium:  "http://image.eveonline.com/Character/#{@id}_128.jpg"
    small:   "http://image.eveonline.com/Character/#{@id}_64.jpg"

CharacterSchema
  .method "getSkillTree", (options)->
    {@queued} = options or { queued: false }

    api = @apikey.getClient()
    return api.fetch "char:CharacterSheet", {
      characterID: @id
    }
    .then (result)->
      skills = {}
      for id, skill of result.skills
        skills[id] = {
          id:     id
          level:  skill.level
          points: skill.skillpoints
        }
      return skills
    .then (skills)=>
      api.fetch "char:SkillQueue", {
        characterID: @id
      }
      .then (result)->
        for position, skill of result.skillqueue
          skills[skill.typeID].queued = skills[skill.typeID].queued or []
          skills[skill.typeID].queued.push {
            position: parseInt skill.queuePosition, 10
            level:    parseInt skill.level, 10
            points:   {
              start: parseInt skill.startSP, 10
              end:   parseInt skill.endSP, 10
            }
            time:   {
              start: skill.startTime
              end:   skill.endTime
            }
          }
        return skills

    .then (skills)->
      ids = (parseInt skill.id for id, skill of skills)
      mongoose.model('SkillGroup')
        .find()
        .select('id name skills')
        .populate({
          path: 'skills'
          select: 'id name description rank'
          match: {
            "id": {$in: ids}
            "published": true
          }
        })
        .exec()
        .then (result)->
          result
            .map (group)->
              {
                id:  group.id
                name: group.name
                skills: group.skills.map (skill)->
                  {
                    id:          skill.id
                    name:        skill.name
                    description: skill.description
                    rank:        skill.rank
                    level:       skills[skill.id].level
                    points:      skills[skill.id].points
                    queued:      skills[skill.id].queued or false
                  }
                }
            .filter (group)->
              return group.skills.length > 0
    .then (skills)=>
      if not @queued
        return skills
      else
        return skills
          .map (group)->
            group.skills = group.skills.filter (skill)->
              return skill.queued isnt false
            return group
          .filter (group)->
            return group.skills.length > 0

CharacterSchema
  .method "getAccounts", (options)->
    api = @apikey.getClient()
    api.fetch "char:AccountBalance", {
      characterId: @id
    }
    .then (result)->
      accounts = (account for id, account of result.accounts)
      accounts.map (account)->
        {
          id:       parseInt account.accountID, 10
          key:      parseInt account.accountKey, 10
          balance:  parseFloat account.balance, 10
        }

CharacterSchema
  .method "getAccountsLogs", (options)->
    accountKey = options.accountKey or 1000
    from       = options.from or null
    count      = options.count or 150

    api = @apikey.getClient()
    api.fetch "char:WalletJournal", {
      characterId: @id
      accountKey: accountKey
      fromID:     from
      count:      count
    }

    # Converts result object to an array
    .then (result)->
      (transaction for id, transaction of result.transactions)

    # Map transaction type with its name
    .then (transactions)->
      return api.fetch "eve:RefTypes", {}
      .then (result)->
        transactions.map (transaction)->
          transaction.type =
            id: parseInt transaction.refTypeID, 10
            name: result.refTypes[transaction.refTypeID].refTypeName
          return transaction

    # Map the final result
    .then (transactions)->
      transactions.map (transaction)->
        {
          account:   parseInt accountKey, 10
          date:      transaction.date
          reference: transaction.refID
          amount:    parseFloat transaction.amount, 10
          balance:   parseFloat transaction.balance, 10
          type:      transaction.type.name
          reason:    transaction.reason
        }




CharacterSchema
  .method "refresh", ->
    Q.ninvoke @, "populate", {path: "apikey"}
      .then =>
        # Perform a request to the api key to validate current api
        @apikey.getClient()
      .then (api)=>
        api
          .fetch "char:CharacterSheet", {
            characterID: @id
          }
          .then (result)=>
            @birthdate = result.DoB.content
            @race      = result.race.content
            @bloodline = result.bloodLine.content
            @ancestry  = result.ancestry.content
            @balance   = result.balance.content
            @gender    = result.gender.content

            @corporation = {
              id:   result.corporationID.content
              name: result.corporationName.content
            }

            @alliance = {
              id:   result.allianceID.content
              name: result.allianceName.content
            } if result.allianceID

            @faction = {
              id:   result.factionID.content
              name: result.factionName.content
            } if result.factionID

            @clone     = {
              name:        result.cloneName.content
              skillPoints: result.cloneSkillPoints.content
            }

            for attribute, value of result.attributes
              @attributes[attribute] = {
                value: value.content
              }

            for bonus, value of result.attributeEnhancers
              attribute = bonus.replace /Bonus/, ''
              @attributes[attribute].enhancer = {
                name:  value.augmentatorName.content
                value: value.augmentatorValue.content
              }

      # Save processed result
      .then =>
        Q.ninvoke @, "save"
      .then =>
        @

mongoose.model "Character", CharacterSchema

module.exports = CharacterSchema
