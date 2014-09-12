mongoose        = require "mongoose"
{Schema}        = mongoose
Timestampable   = require "mongoose-timestamp"
UniqueValidator = require "mongoose-unique-validator"
{EveClient}     = require "neow"

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

module.exports =
  ApiKey:       mongoose.model("ApiKey", ApiKeySchema)
  ApiKeySchema: ApiKeySchema
