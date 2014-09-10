mongoose                     = require "mongoose"
{Schema}                     = mongoose
Timestampable                = require "mongoose-timestamp"
{EveClient}                  = require "neow"

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
  ApiKeySchema: ApiKeySchema
