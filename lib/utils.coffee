mongoose         = require "mongoose"
Q                = require "q"
https            = require "https"
fs               = require "fs"
os               = require "os"
path             = require "path"
crypto           = require "crypto"
debug            = (require "debug")("overseer:utils")
Decompress       = require "decompress"
bzip2            = require "decompress-bzip2"
sqlite3          = require "q-sqlite3"
{exec}           = require "child_process"

class StaticDataLoader
  SDE_BASE_URL = "https://www.fuzzwork.co.uk/dump"

  prepare: =>
    debug "Initialize dataloader"
    deferred = Q.defer()
    return Q()
      .then =>
        debug "Fetching version metadata"
        deferred = Q.defer()
        https.get "#{SDE_BASE_URL}/", (response)=>
          body = ''
          response.on "data", (chunk)->
            body += chunk
          response.on "end", =>
            pattern = /"([a-z]+)-(\d\.\d(?:\.\d)?)-(\d{5,})\/"/gi
            latest = body
              .match pattern
              .map (match)->
                result = pattern.exec match
                return result if result is null
                {
                  name    : result[1]
                  version : result[2]
                  build   : parseInt result[3], 10
                }
              .filter (match)->
                return match isnt null and match.name isnt "retribution"
              .reduce (previous, current)->
                if previous is undefined or current.build > previous.build
                  return current
                else
                  return previous

            for key, value of latest
              @[key] = value

            deferred.resolve latest

        return deferred.promise

      .then ->
        md5file = "#{SDE_BASE_URL}/sqlite-latest.sqlite.bz2.md5"
        debug "Downloading checksum"
        deferred = Q.defer()
        https
          .get md5file, (response)->
            checksum = ''

            response.on "data", (data)->
              checksum += data

            response.on "end", (data)->
              parts = /^([a-f0-9]+)\s+(.*)\n/.exec(checksum)

              if parts is null
                deferred.reject new Error "Fail to parse checksum file"
              else
                deferred.resolve parts[1]

          .on "error", (error)->
            deferred.reject error
        .end()

        return deferred.promise

      .then (checksum)=>
        release  = "#{@name}-#{@version}-#{@build}"
        url      = "/#{release}/eve.db.bz2"
        deferred = Q.defer()

        StaticData = mongoose.model "StaticData"
        StaticData
          .findOne { checksum: checksum }
          .exec()
          .then (version)->
            if version isnt null
              deferred.reject new Error "Database is up-to-date"
            else
              dbfile     = path.join os.tmpdir(), path.basename url

              md5sum = crypto.createHash "md5"
              md5sum.setEncoding "hex"
              stream = fs.createReadStream dbfile

              stream.pipe md5sum

              stream.on "error", (err)->
                debug "Downloading database for #{release}"
                md5sum = crypto.createHash "md5"
                md5sum.setEncoding "hex"
                stream = fs.createWriteStream dbfile
                https.get "#{SDE_BASE_URL}/#{url}", (response)->
                  # Compute checksum
                  response.pipe md5sum

                  # Download database
                  response.pipe stream

                  response.on "end", ->
                    # Validating checksum
                    md5sum.end()
                    if checksum isnt md5sum.read()
                      deferred.reject new Error "Checksum validation failed"
                    deferred.resolve dbfile

              stream.on "end", ->
                md5sum.end()
                if checksum is md5sum.read()
                  debug "Skip database download : checksum match"
                  return deferred.resolve dbfile
                else
                  @emit "error", new Error "Checksum validation failed"

        return deferred.promise

      .then (bz2file)->
        debug "Uncompressing #{bz2file}"
        deferred = Q.defer()

#        exec "bunzip2 --force --keep --quiet #{bz2file}", (err)->
#          return deferred.reject err if err
#          deferred.resolve bz2file.replace(/\.bz2$/, '')

        decompress = new Decompress
        decompress
          .src bz2file
          .dest os.tmpdir()
          .use bzip2()
          .run (err, files)->
            return deferred.reject err if err
            deferred.resolve bz2file.replace(/\.bz2$/, '')

        return deferred.promise

      .then (dbfile)=>
        debug "Loading sqlite database #{dbfile}"
        deferred = Q.defer()
        db = new sqlite3.createDatabase dbfile
        db.then (db)=>
          debug "Database loaded"
          @db = db
          deferred.resolve @

        return deferred.promise

    return deferred.promise

  fetch: (table, callback)=>
    debug "Fetching data from #{table}"
    @db
      .all "SELECT * FROM `#{table}`"
      .then (items)->
        return Q.allSettled items.map callback
      .then =>
        return @


module.exports =
  StaticDataLoader: StaticDataLoader
