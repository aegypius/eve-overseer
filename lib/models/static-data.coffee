mongoose           = require "mongoose"
{Schema}           = mongoose
Q                  = require "q"
{StaticDataLoader} = require "../utils"
debug              = (require "debug")("overseer:static-data")

VersionSchema = new Schema {
  name:     String
  version:  String
  checksum: String
}

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

VersionSchema.statics.import = ->
  deferred = Q.defer()
  Loader = new StaticDataLoader

  Icons = mongoose.model "Icons"
  Units = mongoose.model "Units"

  Q()
    .then Loader.prepare
    .then Icons.import
    .then Units.import

    .fail (err)->
      debug "An error occured during upgrade"
      deferred.reject err

    .done ->
      deferred.resolve()

  return deferred.promise

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


mongoose.model "Versions",       VersionSchema
mongoose.model "Icons",          IconSchema
mongoose.model "Units",          UnitSchema
