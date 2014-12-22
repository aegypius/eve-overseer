mongoose           = require "mongoose"
{Schema}           = mongoose
Q                  = require "q"
debug              = (require "debug")("overseer:static-data:inventory")

CategorySchema =  new Schema {
  id: Number
  name: String
  description: String
  icon : {
    type: Schema.ObjectId
    ref: 'Icon'
  }
  published: Boolean
}

CategorySchema.statics.import = (loader)->
  debug "Importing inventory categories"
  Icon      = mongoose.model "Icons"
  Category  = mongoose.model "InventoryCategory"

  loader.fetch "invCategories", (category)->
    query = Q.defer()
    Icon
      .findOne {id: category.iconID }
      .exec()
      .then (icon)->
        Category.update {
          id: category.categoryID
        }, {
          id:               category.categoryID
          name:             category.categoryName
          description:      category.description
          published:        !!category.published
          icon:             icon
        }, {
          safe:   true
          upsert: true
        }, (err)->
          return query.reject err if err
          query.resolve()
    return query.promise

GroupSchema = new Schema {
  id: Number
  name: String
  description: String
  category : {
    type: Schema.ObjectId
    ref: 'InventoryCategory'
  }
  icon : {
    type: Schema.ObjectId
    ref: 'Icon'
  }
  useBasePrice:         Boolean
  allowManufacture:     Boolean
  allowRecycler:        Boolean
  anchored:             Boolean
  anchorable:           Boolean
  fittableNonSingleton: Boolean
  published:            Boolean
}

GroupSchema.statics.import = (loader)->
  debug "Importing inventory groups"
  Icon      = mongoose.model "Icons"
  Category  = mongoose.model "InventoryCategory"
  Group     = mongoose.model "InventoryGroup"

  loader.fetch "invGroups", (group)->
    query = Q.defer()
    Icon.findOne {id: group.iconID }
      .exec()
      .then (icon)->
        Category.findOne {id: group.categoryID }
          .exec()
          .then (category)->
            Group.update {
              id: group.groupID
            }, {
              id:                    group.groupID
              name:                  group.groupName
              description:           group.description
              category:              category
              icon:                  icon
              useBasePrice:          !!group.useBasePrice
              allowManufacture:      !!group.allowManufacture
              allowRecycler:         !!group.allowRecycler
              anchored:              !!group.anchored
              anchorable:            !!group.anchorable
              fittableNonSingleton:  !!group.fittableNonSingleton
              published:             !!group.published
            }, {
              safe:   true
              upsert: true
            }, (err)->
              if err
                return query.reject err
              query.resolve()
    return query.promise

TypeSchema = new Schema {
  id: Number
  name: String
  description: String
  group : {
    type: Schema.ObjectId
    ref: 'InventoryGroup'
  }
  race : {
    type: Schema.ObjectId
    ref: 'Race'
  }
  mass: Number
  volume: Number
  portionSize: Number
  basePrice: Number
  changeOfDuplicating: Number
  published: Boolean
}

TypeSchema.statics.import = (loader)->
  debug "Importing inventory types"
  Race      = mongoose.model "Races"
  Group     = mongoose.model "InventoryGroup"
  Type      = mongoose.model "InventoryType"

  loader.fetch "invTypes", (type)->
    query = Q.defer()
    Race.findOne {id: type.raceID }
      .exec()
      .then (race)->
        Group.findOne {id: type.groupID }
          .exec()
          .then (group)->
            Type.update {
              id: type.typeID
            }, {
              id:                    type.typeID
              name:                  type.typeName
              description:           type.description
              race:                  race
              group:                 group
              mass:                  parseFloat type.mass, 10
              volume:                parseFloat type.volume, 10
              capacity:              parseFloat type.capacity, 10
              portionSize:           parseFloat type.portionSize, 10
              basePrice:             parseFloat type.basePrice, 10
              chanceOfDuplicating:   parseFloat type.chanceOfDuplicating, 10
              published:             !!type.published
            }, {
              safe:   true
              upsert: true
            }, (err)->
              if err
                console.log err
                return query.reject err
              query.resolve()
    return query.promise

module.exports =
  CategorySchema: CategorySchema
  GroupSchema:    GroupSchema
  TypeSchema:     TypeSchema
