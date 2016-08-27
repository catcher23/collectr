'use strict';

var passport = require('passport'),
  url = require('url'),
  TwitterStrategy = require('passport-twitter').Strategy,
  config = require('../config'),
  users = require('../../app/controllers/users.server.controller');

module.exports = function() {
  // Use the Passport's Twitter strategy
  passport.use(new TwitterStrategy({
      consumerKey: config.twitter.clientID,
      consumerSecret: config.twitter.clientSecret,
      callbackURL: config.twitter.callbackURL,
      passReqToCallback: true
    },
    function(req, token, tokenSecret, profile, done) {
      // Set the user's provider data and include tokens
      var providerData = profile._json;
      providerData.token = token;
      providerData.tokenSecret = tokenSecret;

      // Create the user OAuth profile
      var providerUserProfile = {
        fullName: profile.displayName,
        username: profile.username,
        provider: 'twitter',
        providerId: profile.id,
        providerData: providerData
      };

      users.saveOAuthUserProfile(req, providerUserProfile, done);
    }
  ));
};