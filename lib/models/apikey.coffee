mongoose        = require "mongoose"
{Schema}        = mongoose
Timestampable   = require "mongoose-timestamp"
UniqueValidator = require "mongoose-unique-validator"
{EveClient}     = require "neow"
{Character}     = require "./character"

ApiKeySchema  = new Schema {
  _user: {
    type: Schema.ObjectId
    ref: 'User'
  }
  keyId: {
    type:     String
    unique:   true
    required: true
  }
  verificationCode: {
    type:     String
    required: true
  }
  accessMask: {
    type: Number
  }
  characters: [{
    type: Schema.ObjectId
    ref: 'Character'
  }]
}

ApiKeySchema.plugin Timestampable
ApiKeySchema.plugin UniqueValidator

ApiKeySchema
  .path "keyId"
    .validate (keyId)->
      return keyId.length
    , "Key ID cannot be blank"

ApiKeySchema
  .path "verificationCode"
    .validate (verificationCode)->
      return verificationCode.length
    , "Verification Code cannot be blank"

ApiKeySchema
  .pre "save", (next)->
    next() unless @isNew

    # Perform a request to the api key to validate current api
    api = new EveClient {
      keyID: @keyId
      vCode: @verificationCode
    }

    api.fetch 'account:APIKeyInfo'
      .then (result)=>
        @accessMask = result.key.accessMask

        for id, data of result.key.characters
          character = new Character {
            id:     data.characterID
            name:   data.characterName
            apikey: @
          }
          @characters.push character
          character.save()

      .done (result)->
        next()


module.exports =
  ApiKey:       mongoose.model("ApiKey", ApiKeySchema)
  ApiKeySchema: ApiKeySchema
