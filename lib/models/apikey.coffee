mongoose          = require "mongoose"
{Schema}          = mongoose
Timestampable     = require "mongoose-timestamp"
{CharacterSchema} = require "./character"

ApiKeySchema  = new Schema {
  id: {
    type:     String
    unique:   true
    required: true
  }
  verification: {
    type:     String
    required: true
  }
  characters: [CharacterSchema]
}

ApiKeySchema.plugin Timestampable

ApiKeySchema
  .path "id"
    .validate (id)->
      return id.length
    , "Key ID cannot be blank"

ApiKeySchema
  .path "verification"
    .validate (verification)->
      return verification.length
    , "Verification Code cannot be blank"

module.exports =
  ApiKey:       mongoose.model("ApiKey", ApiKeySchema)
  ApiKeySchema: ApiKeySchema
