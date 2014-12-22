mongoose           = require "mongoose"
{Schema}           = mongoose
Q                  = require "q"
debug              = (require "debug")("overseer:static-data:character")

RaceSchema = new Schema {
  id: Number
  name: String
  shortDescription: String
  description: String
  icon : {
    type: Schema.ObjectId
    ref: 'Icon'
  }
}

AttributeSchema = new Schema {
  id: Number
  name: String
  shortDescription: String
  description: String
  notes: String
  icon : {
    type: Schema.ObjectId
    ref: 'Icon'
  }
}

BloodlineSchema = new Schema {
  id: Number
  name: String
  shortDescription: {
    generic: String
    male: String
    female: String
  }
  description: {
    generic: String
    male: String
    female: String
  }
  attributes: {
    perception: Number
    willpower: Number
    charisma: Number
    memory: Number
    intelligence: Number
  }
  race: {
    type: Schema.ObjectId
    ref: 'Race'
  }
  icon: {
    type: Schema.ObjectId
    ref: 'Icon'
  }
  shipType: {
    type: Schema.ObjectId
    ref: 'ShipType'
  }
  corporation: {
    type: Schema.ObjectId
    ref: 'Corporation'
  }
}

AncestrySchema = new Schema {
  id: Number
  name: String
  shortDescription: String
  description: String
  attributes: {
    perception: Number
    willpower: Number
    charisma: Number
    memory: Number
    intelligence: Number
  }
  bloodline: {
    type: Schema.ObjectId
    ref: 'Bloodline'
  }
  icon: {
    type: Schema.ObjectId
    ref: 'Icon'
  }
}


AttributeSchema.statics.import = (loader)->
  debug "Importing attributes"
  Icon       = mongoose.model "Icons"
  Attribute  = mongoose.model "Attributes"

  loader.fetch "chrAttributes", (attribute)->
    query = Q.defer()
    Icon
      .findOne {id: attribute.iconID }
      .exec()
      .then (icon)->
        Attribute.update {
          id: attribute.attributeID
        }, {
          id:               attribute.attributeID
          name:             attribute.attributeName
          shortDescription: attribute.shortDescription
          description:      attribute.description
          notes:            attribute.notes
          icon:             icon
        }, {
          safe:   true
          upsert: true
        }, (err)->
          return query.reject err if err
          query.resolve()
    return query.promise

RaceSchema.statics.import = (loader)->
  debug "Importing races"
  Icon  = mongoose.model "Icons"
  Race  = mongoose.model "Races"

  loader.fetch "chrRaces", (race)->
    query = Q.defer()
    Icon
      .findOne {id: race.iconID }
      .exec()
      .then (icon)->
        Race.update {
          id: race.raceID
        }, {
          id:               race.raceID
          name:             race.raceName
          shortDescription: race.shortDescription
          description:      race.description
          icon:             icon
        }, {
          safe:   true
          upsert: true
        }, (err)->
          return query.reject err if err
          query.resolve()
    return query.promise

module.exports =
  RaceSchema:      RaceSchema
  AttributeSchema: AttributeSchema
  BloodlineSchema: BloodlineSchema
  AncestrySchema:  AncestrySchema
