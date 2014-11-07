mongoose           = require "mongoose"
{Schema}           = mongoose
Q                  = require "q"
{StaticDataLoader} = require "../utils"
debug              = (require "debug")("overseer:static-data")

StaticDataSchema = new Schema {
  name:     String
  version:  String
  checksum: String
}

#
# Schema mapping for eveIcons table
#
StaticDataIconSchema = new Schema {
  id: Number
  file: String
  description: String
}

StaticDataIconSchema.statics.import = (loader)->
  deferred = Q.defer()
  debug "Importing icons"

  loader
    .fetch "eveIcons"
    .then (icons)->
      icons.map (icon)->
        debug icon

  return deferred.promise

#
# Schema mapping for eveUnits table
#
StaticDataUnitSchema = new Schema {
  id: Number
  name: String
  displayName: String
  description: String
}

StaticDataUnitSchema.statics.import = (loader)->
  deferred = Q.defer()
  debug "Importing units"
  return deferred.promise


InventoryCategorySchema = new Schema {
  id: Number
  name: String
  description: String
  icon: {
    type: Schema.ObjectId
    ref:  'StaticDataIcon'
  }
  published: Boolean
}

InventoryGroupSchema = new Schema {
  id: Number
}

promises =
  import:
    inventory: ->
      debug "Importing inventory"
      deferred = Q.defer()
      deferred.promise


StaticDataSchema.statics.import = ->
  deferred = Q.defer()
  Loader = new StaticDataLoader

  Icons = mongoose.model "StaticDataIcon"
  Units = mongoose.model "StaticDataUnit"

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

mongoose.model "StaticData",     StaticDataSchema
mongoose.model "StaticDataIcon", StaticDataIconSchema
mongoose.model "StaticDataUnit", StaticDataUnitSchema
