mongoose           = require "mongoose"
{Schema}           = mongoose
Q                  = require "q"
debug              = (require "debug")("overseer:static-data:global")

IconSchema = new Schema {
  id: Number
  file: String
  description: String
}

UnitSchema = new Schema {
  id: Number
  name: String
  displayName: String
  description: String
}

IconSchema.statics.import = (loader)->
  debug "Importing icons"
  Icon = mongoose.model "Icons"

  loader.fetch "eveIcons", (icon)->
    query = Q.defer()
    Icon.update {
      id: icon.iconID
    }, {
      id:          icon.iconID
      file:        icon.iconFile
      description: icon.description
    }, {
      safe:   true
      upsert: true
    }, (err)->
      return query.reject err if err
      query.resolve()
    return query.promise

UnitSchema.statics.import = (loader)->
  debug "Importing units"
  Unit  = mongoose.model "Units"

  loader.fetch "eveUnits", (unit)->
    query = Q.defer()
    Unit.update {
      id: unit.unitID
    }, {
      id:          unit.unitID
      name:        unit.unitName
      displayName: unit.displayName
      description: unit.description
    }, {
      safe:   true
      upsert: true
    }, (err)->
      return query.reject err if err
      query.resolve()
    return query.promise

module.exports =
  IconSchema: IconSchema
  UnitSchema: UnitSchema
