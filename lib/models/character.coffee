mongoose       = require "mongoose"
{Schema}       = mongoose
Timestampable  = require "mongoose-timestamp"

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

CharacterSchema
  .virtual "picture"
  .get ()->
    poster:  "http://image.eveonline.com/Character/#{@id}_1024.jpg"
    large:   "http://image.eveonline.com/Character/#{@id}_512.jpg"
    medium:  "http://image.eveonline.com/Character/#{@id}_256.jpg"
    small:   "http://image.eveonline.com/Character/#{@id}_64.jpg"

module.exports =
  Character:       mongoose.model("Character", CharacterSchema)
  CharacterSchema: CharacterSchema
