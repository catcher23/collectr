'use strict';

var User = require('mongoose').model('User'),
  passport = require('passport');

// Create a new error handling controller method
var getErrorMessage = function(err) {
  var message = '';

  if (err.code) {
    switch (err.code) {
      // If a unique index error occurs set the message error
      case 11000:
      case 11001:
        message = 'Username already exists';
        break;
      // If a general error occurs set the message error
      default:
        message = 'Something went wrong';
    }
  } else {
    // Grab the first error message from a list of possible errors
    for (var errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }

  return message;
};

exports.renderSignin = function(req, res, next) {
  // If user is not connected render the signin page, otherwise redirect the user back to the main application page
  if (!req.user) {
    // Use the 'response' object to render the signin page
    res.render('signin', {
      // Set the page title variable
      title: 'Sign-in Form',
      // Set the flash message variable
      messages: req.flash('error') || req.flash('info')
    });
  } else {
    return res.redirect('/');
  }
};

exports.renderSignup = function(req, res, next) {
  // If user is not connected render the signup page, otherwise redirect the user back to the main application page
  if (!req.user) {
    // Use the 'response' object to render the signup page
    res.render('signup', {
      // Set the page title variable
      title: 'Sign-up Form',
      // Set the flash message variable
      messages: req.flash('error')
    });
  } else {
    return res.redirect('/');
  }
};

exports.signup = function(req, res, next) {
  // If user is not connected, create and login a new user, otherwise redirect the user back to the main application page
  if (!req.user) {
    var user = new User(req.body);
    var message = null;

    user.provider = 'local';

    user.save(function(err) {
      if (err) {
        var message = getErrorMessage(err);

        req.flash('error', message);

        return res.redirect('/signup');
      }

      req.login(user, function(err) {
        if (err) return next(err);

        return res.redirect('/');
      });
    });
  } else {
    return res.redirect('/');
  }
};

// Create a new controller method that creates new 'OAuth' users
exports.saveOAuthUserProfile = function(req, profile, done) {
  // Try finding a user document that was registered using the current OAuth provider
  User.findOne({
    provider: profile.provider,
    providerId: profile.providerId
  }, function(err, user) {
    if (err) {
      return done(err);
    } else {
      if (!user) {
        // Set a possible base username
        var possibleUsername = profile.username || ((profile.email) ? profile.email.split('@')[0] : '');

        User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
          profile.username = availableUsername;

          user = new User(profile);

          user.save(function(err) {
            return done(err, user);
          });
        });
      } else {
        return done(err, user);
      }
    }
  });
};

exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

exports.requiresLogin = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send({
      message: 'User is not logged in'
    });
  }
  
  next();
};