mongoose           = require "mongoose"
{Schema}           = mongoose
Q                  = require "q"
{StaticDataLoader} = require "../../utils"
debug              = (require "debug")("overseer:static-data")

{IconSchema, UnitSchema}                   = require "./global.coffee"
{AttributeSchema, RaceSchema}              = require "./character.coffee"
{ActivitySchema}                           = require "./corporation.coffee"
{UniverseSchema, CelestialStatisticSchema} = require "./map.coffee"
inventory  = require "./inventory.coffee"

VersionSchema = new Schema {
  name:     String
  version:  String
  checksum: String
}

VersionSchema.statics.import = ->
  deferred = Q.defer()
  Loader = new StaticDataLoader

  Icons               = mongoose.model "Icons"
  Units               = mongoose.model "Units"
  Attributes          = mongoose.model "Attributes"
  Races               = mongoose.model "Races"
  Activities          = mongoose.model "Activities"
  Universes           = mongoose.model "Universes"
  InventoryCategory   = mongoose.model "InventoryCategory"
  InventoryGroup      = mongoose.model "InventoryGroup"
  InventoryType       = mongoose.model "InventoryType"

  Q()
    .then Loader.prepare
    .then Icons.import
    .then Units.import
    .then Attributes.import
    .then Races.import
    .then Activities.import
    .then Universes.import
    .then InventoryCategory.import
    .then InventoryGroup.import
    .then InventoryType.import

    .fail (err)->
      debug "An error occured during upgrade"
      deferred.reject err

    .done ->
      deferred.resolve()

  return deferred.promise

mongoose.model "Versions",            VersionSchema
mongoose.model "Icons",               IconSchema
mongoose.model "Units",               UnitSchema
mongoose.model "Attributes",          AttributeSchema
mongoose.model "Races",               RaceSchema
mongoose.model "Activities",          ActivitySchema
mongoose.model "Universes",           UniverseSchema
mongoose.model "InventoryCategory",   inventory.CategorySchema
mongoose.model "InventoryGroup",      inventory.GroupSchema
mongoose.model "InventoryType",       inventory.TypeSchema
