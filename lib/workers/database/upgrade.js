var Q              = require("q");
var mongoose       = require("mongoose");
var models         = require("../../models");
var SkillGroup     = models.SkillGroup;
var OAuthClients   = mongoose.model("OAuthClients");
var debug          = require('debug')('overseer:database:upgrade');

module.exports = function () {

  debug('Starting upgrade');

  return Q()
    .then(SkillGroup.synchronize)
    .then(function () {
      debug("Skill Tree updated");
    })
    .catch(function (error) {
      debug("Skill Tree failed to update: ", error.message);
    })
    .then(function () {
      var clientId = process.env.CLIENT_ID || false;
      var clientSecret = process.env.CLIENT_SECRET || false;

      if (clientId && clientSecret) {
        OAuthClients
          .findOne({ clientId: clientId })
          .exec()
          .then(function (client) {
            if (!client) {
              debug('Creating OAuth client');
              return OAuthClients.create({
                clientId:     clientId,
                clientSecret: clientSecret,
                redirectUri:  '/login'
              }).exec();
            }
            return client;
          });
      }
    })
    .then(function () {
      debug("Frontend client registered");
    })
    .catch(function() {
      debug("Upgrade failed")
    })
  ;
}
