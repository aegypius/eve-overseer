mongoose = require "mongoose"
{Schema} = mongoose
debug    = (require "debug")("overseer:oauth2")

User     = mongoose.model "User"

OAuthAccessTokensSchema = new Schema {
  accessToken:
    type: String
    required: true
    unique: true
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
      email:    username.toLowerCase()
    }, (err, user)->
      callback err, false if err

      if user.authentificate password
        callback err, user._id
      else
        callback err, false

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

  getUserFromClient: (clientId, clientSecret, callback)->
    debug "request user for #{clientId}"

    callback false, 'anon.'
