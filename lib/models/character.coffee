mongoose        = require "mongoose"
{Schema}        = mongoose
Timestampable   = require "mongoose-timestamp"
UniqueValidator = require "mongoose-unique-validator"
{EveClient}     = require "neow"
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
  .method "refresh", ->
    Q.ninvoke @, "populate", {path: "apikey"}
      .then =>
        # Perform a request to the api key to validate current api
        new EveClient {
          keyID: @apikey.keyId
          vCode: @apikey.verificationCode
        }
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

module.exports =
  Character:       mongoose.model("Character", CharacterSchema)
  CharacterSchema: CharacterSchema
