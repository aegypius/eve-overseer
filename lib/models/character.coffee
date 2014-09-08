mongoose      = require "mongoose"
{Schema}      = mongoose
Timestampable = require "mongoose-timestamp"

CharacterSchema  = new Schema {
  id: {
    type:     String
    unique:   true
    required: true
  }
  name:      String
  birthdate: String
  race:      String
  bloodline: String
  ancestry:  String
  gender:    String
}

CharacterSchema.plugin Timestampable

module.exports =
  Character:       mongoose.model("Character", CharacterSchema)
  CharacterSchema: CharacterSchema
