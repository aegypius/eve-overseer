mongoose        = require "mongoose"
{Schema}        = mongoose
Timestampable   = require "mongoose-timestamp"
UniqueValidator = require "mongoose-unique-validator"
crypto          = require "crypto"
oAuthTypes      = []

# User Schema
# ===========
UserSchema = new Schema {
  username: {
    type: String
    require: true
  }
  email: {
    type: String
    unique: true
    require: true
    lowercase: true
  }
  provider: {
    type: String
    default: 'local'
  }
  tokens: []
  apikeys: [{
    type: Schema.ObjectId
    ref: 'ApiKey'
  }]
  hashed_password: {
    type: String
    require: true
  }
  salt: {
    type: String
  }
  reset_password_token:   String
  reset_password_expires: String
}

UserSchema.plugin Timestampable
UserSchema.plugin UniqueValidator


# Virtuals
# ========
UserSchema
  .virtual "password"
  .set (password)->
    @_password = password
    @salt = @generateSalt()
    @hashed_password = @encryptPassword password
  .get ()=>
    @_password

UserSchema
  .virtual "user_info"
  .get ()->
    {
      "_id":      @_id
      "username": @username
      "email":    @email
      "avatar":   @gravatar(120)
    }

# Validations
# ===========
validatePresenceOf = (value)->
  return value && value.length

UserSchema
  .path "username"
    .validate (username)->
      return @doesNotRequireValidation() or username.length
    , "Username cannot be blank"

UserSchema
  .path "email"
    .validate (email)->
      return @doesNotRequireValidation() or email.length
    , "Email cannot be blank"

UserSchema
  .path "hashed_password"
    .validate (hashed_password)->
      return @doesNotRequireValidation() or hashed_password.length
    , "Password cannot be blank"

# Pre-Save hook
# =============
UserSchema
  .pre "save", (next)->
    next() unless @isNew

    if validatePresenceOf @password and oAuthTypes.indexOf @provider is -1
      next new Error "Invalid password"
    else
      next()

# Methods
# =======
UserSchema.methods =

  # Authentificate - check if the passwords are the same
  authentificate: (password)->
    @hashed_password is @encryptPassword password

  # Generate salt
  generateSalt: ()->
    '' + Math.round (new Date).valueOf() * Math.random()

  # Encrypt password
  encryptPassword: (password)->
    return '' unless password

    try
      return crypto
        .createHmac 'sha1', @salt
        .update password
        .digest 'hex'

    catch err
      return ''

  generateConfirmationToken: (password)->
    return '' unless password

    try
      return crypto
        .createHmac 'sha1', @salt
        .update password
        .digest 'hex'

    catch err
      return ''

  roleAdmin: ->
    return 1

  gravatar: (size, alt)->
    size = 200 unless size?
    alt  = "identicon" unless alt?

    return "https://gravatar.com/avatar/?s=#{size}&d=#{alt}" unless @email

    hash = crypto
      .createHash 'md5'
      .update @email
      .digest 'hex'

    return "https://gravatar.com/avatar/#{hash}?s=#{size}&d=identicon"

  doesNotRequireValidation: ->
    return ~oAuthTypes.indexOf @provider


module.exports =
  User: mongoose.model("User", UserSchema)
  UserSchema: UserSchema
