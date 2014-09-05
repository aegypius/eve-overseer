mongoose      = require "mongoose"
{Schema}      = mongoose
Timestampable = require "mongoose-timestamp"

ApiKeySchema  = new Schema {
  id: {
    type:     String
    required: true
  }
  verification: {
    type:     String
    required: true
  }
}

ApiKeySchema.plugin Timestampable

module.exports = mongoose.model("ApiKey", ApiKeySchema)
