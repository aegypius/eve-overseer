mongoose        = require "mongoose"
{Schema}        = mongoose
Timestampable   = require "mongoose-timestamp"
UniqueValidator = require "mongoose-unique-validator"
{EveClient}     = require "neow"
User            = mongoose.model("User")
{Character}     = require "./character"
Q               = require "q"

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
  expires:   Date
  account: {
    createdAt:    Date
    paidUntil:    Date
    logonCount:   Number
    logonMinutes: Number
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
  .method "getClient", ->
    new EveClient {
      keyID: @keyId
      vCode: @verificationCode
    }

  .method "refresh", ->
    # Perform a request to the api key to validate current api
    api = @getClient()

    Q()
      .then =>
        api.fetch 'account:APIKeyInfo'
          .then (result)=>
            @accessMask = result.key.accessMask
            @expires    = result.key.expires
            characters  = []
            for id, data of result.key.characters
              character = new Character {
                id:     data.characterID
                name:   data.characterName
                corporation: {
                  id:   data.corporationID
                  name: data.corporationName
                } unless data.corporationID is "0"
                alliance: {
                  id:   data.allianceID
                  name: data.allianceName
                } unless data.allianceID is "0"
                faction: {
                  id:   data.factionID
                  name: data.factionName
                } unless data.factionID is "0"
                apikey: @
              }
              @characters.push character
              characters.push(character.save())

            return Q.all(characters)
      .then =>
        api.fetch "account:AccountStatus"
          .then (result)=>
            @account.creation     = result.createDate.content
            @account.paidUntil    = result.paidUntil.content
            @account.logonCount   = result.logonCount.content
            @account.logonMinutes = result.logonMinutes.content

ApiKeySchema

  # Cascade delete related documents
  # ================================
  .pre "remove", (next)->

    User
      .find { "apikeys": @_id }
      .exec()
      .then (users)->
        for user in users
          user.apikeys = user.apikeys.filter (apikey)->
            apikey is @_id
          user.save()


    Character
      .find { apikey: @_id }
      .exec()
      .then (characters)->
        for character in characters
          character.remove()
        next()

  # Cascade create related documents
  # ================================
  .pre "save", (next)->
    next() unless @isNew

    # Link ApiKey to its user
    User.findById @_user, (err, user)=>
      user.apikeys.push @
      return user.save()

    # Refresh data from api
    @refresh()
      .done ->
        next()


module.exports =
  ApiKey:       mongoose.model("ApiKey", ApiKeySchema)
  ApiKeySchema: ApiKeySchema
