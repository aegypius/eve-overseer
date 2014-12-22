mongoose             = require "mongoose"
{Schema,VirtualType} = mongoose
Q                    = require "q"
debug                = (require "debug")("overseer:static-data:map")

Point = new Schema {
  x: Number
  y: Number
  z: Number
}

UniverseSchema = new Schema {
  id: Number
  name: String
  coordinates: [Point]
  minCoordinates: [Point]
  maxCoordinates: [Point]
}

ConstellationSchema = new Schema {
  id: Number
  coordinates: [Point]
  minCoordinates: [Point]
  maxCoordinates: [Point]
  radius: Number
  faction: {
    type: Schema.ObjectId
    ref: 'Faction'
  }
  region: {
    type: Schema.ObjectId
    ref: 'Region'
  }
}

CelestialStatisticSchema = new Schema {
  id: Number
  temperature: Number
  spectralClass: String
  luminosity: Number
  age: Number
  life: Number
  orbitRadius: Number
  eccentricity: Number
  massDust: Number
  massGas: Number
  fragmented: Number
  density: Number
  surfaceGravity: Number
  escapeVelocity: Number
  orbitPeriod: Number
  locked: Number
  pressure: Number
  radius: Number
  mass: Number
}

UniverseSchema.statics.import = (loader)->
  debug "Importing universe"
  Universe = mongoose.model "Universes"

  loader.fetch "mapUniverse", (universe)->
    query = Q.defer()
    Universe.update {
      id: universe.universeID
    }, {
      id:          universe.universeID
      name:        universe.universeName
      coordinates: {
        x: universe.x
        y: universe.y
        z: universe.z
      }
      minCoordinates: {
        x: universe.xMin
        y: universe.yMin
        z: universe.zMin
      }
      maxCoordinates: {
        x: universe.xMax
        y: universe.yMax
        z: universe.zMax
      }
    }, {
      safe:   true
      upsert: true
    }, (err)->
      return query.reject err if err
      query.resolve()
    return query.promise

CelestialStatisticSchema.statics.import = (loader)->
  debug "Importing celestial statistics"
  CelestialStatistic = mongoose.model "CelestialStatistics"

  loader.fetch "mapCelestialStatistics", (stat)->
    query = Q.defer()
    CelestialStatistic.update {
      id: stat.celestialID
    }, {
      id:             stat.celestialID
      temperature:    stat.temperature
      spectralClass:  stat.spectralClass
      luminosity:     stat.luminosity
      age:            stat.age
      life:           stat.life
      orbitRadius:    stat.orbitRadius
      eccentricity:   stat.eccentricity
      massDust:       stat.massDust
      massGas:        stat.massGas
      fragmented:     stat.fragmented
      density:        stat.density
      surfaceGravity: stat.surfaceGravity
      escapeVelocity: stat.escapeVelocity
      orbitPeriod:    stat.orbitPeriod
      locked:         stat.locked
      pressure:       stat.pressure
      radius:         stat.radius
      mass:           stat.mass
    }, {
      safe:   true
      upsert: true
    }, (err)->
      return query.reject err if err
      query.resolve()
    return query.promise

module.exports =
  UniverseSchema:           UniverseSchema
  CelestialStatisticSchema: CelestialStatisticSchema
