mongoose           = require "mongoose"
{Schema}           = mongoose
Q                  = require "q"
debug              = (require "debug")("overseer:static-data:corporation")

ActivitySchema = new Schema {
  id: Number
  name: String
  description: String
}

CorporationSchema = new Schema {

}

ActivitySchema.statics.import = (loader)->
  debug "Importing activities"
  Activity = mongoose.model "Activities"

  loader.fetch "crpActivities", (activity)->
    query = Q.defer()
    Activity.update {
      id: activity.activityID
    }, {
      id:          activity.activityID
      name:        activity.activityName
      description: activity.description
    }, {
      safe:   true
      upsert: true
    }, (err)->
      return query.reject err if err
      query.resolve()
    return query.promise


module.exports =
  ActivitySchema: ActivitySchema
