mongoose = require "mongoose"
{Schema} = mongoose
{User}   = require "./user"
debug    = (require "debug")("overseer:oauth2")

OAuthAccessTokensSchema = new Schema {
  accessType: String
  clientId: String
  userId: String
  expires: Date
}

OAuthRefreshTokensSchema = new Schema {
  refreshToken: String
  clientId: String
  userId: String
  expires: Date
}

OAuthClientsSchema = new Schema {
  clientId: String
  clientSecret: String
  redirectUri: String
}

mongoose.model "OAuthAccessTokens", OAuthAccessTokensSchema
mongoose.model "OAuthRefreshTokens", OAuthRefreshTokensSchema
mongoose.model "OAuthClients", OAuthClientsSchema

OAuthAccessTokens  = mongoose.model "OAuthAccessTokens"
OAuthRefreshTokens = mongoose.model "OAuthRefreshTokens"
OAuthClients       = mongoose.model "OAuthClients"
OAuthUsers         = User

module.exports =
  getAccessToken: (bearerToken, callback)->
    debug "get access token for #{bearerToken}"

    OAuthAccessTokens.findOne { accessToken: bearerToken }, callback

  getClient: (clientId, clientSecret, callback)->
    debug "get client for #{clientId}:#{clientSecret}"

    unless clientSecret
      OAuthClients.findOne {
        clientId: clientId
      }, callback
    else
      OAuthClients.findOne {
        clientId:     clientId
        clientSecret: clientSecret
      }, callback

  grantTypeAllowed: (clientId, grantType, callback)->
    debug "check that client #{clientId} is granted with #{grantType}"

    if grantType is "password"
      debug "should explicitly check clientId with grant type :#{grantType}"

    callback false, true

  saveAccessToken: (token, clientId, expires, userId, callback)->
    debug "save accessToken for #{userId} using #{clientId}"

    accessToken = new OAuthAccessTokens {
      accessToken: token
      clientId:    clientId
      userId:      userId
      expires:     expires
    }

    accessToken.save callback

  getUser: (username, password, callback)->
    debug "get user id for username: #{username} with password"

    OAuthUsers.findOne {
      username: username
      password: password
    }, (err, user)->
      return callback err if err
      callback null, user._id

  saveRefreshToken: (token, clientId, expires, userId, callback)->
    debug "save refreshToken for #{userId} using #{clientId}"

    refreshToken = new OAuthRefreshTokens {
      refreshToken: token
      clientId:    clientId
      userId:      userId
      expires:     expires
    }

    refreshToken.save callback

  getRefreshToken: (refreshToken, callback)->
    debug "get refreshToken #{refreshToken}"

    OAuthRefreshTokens.findOne { refreshToken : refreshToken }, callback
