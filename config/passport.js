var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user')
var bcrypt = require('bcryptjs')

module.exports = function (passport) {
    passport.use(new LocalStrategy(
      function (username, password, done) {
        User.findOne({
          username: username
        }, function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, {
              message: 'Incorrect username.'
            });
          }
          bcrypt.compare(password, user.password, function (err, res) {
            if (err) {
              // handle error
              console.log(err);

            }
            if (res) {
              // Send JWT
              return done(null, user)
            } else {
              // response is OutgoingMessage object that server response http request
              return done(null, false, {
                message: 'passwords do not match'
              });
            }
          });

        });
      }))




      // used to serialize the user for the session
      passport.serializeUser(function (user, done) {
        done(null, user.id);
        // where is this user.id going? Are we supposed to access this anywhere?
      });

      // used to deserialize the user
      passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
          done(err, user);
        });
      });



    };