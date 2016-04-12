var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');
var fs = require('fs');
var songsfolder = __dirname + '/../users/';

module.exports = function (passport) {

    // serialize user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, callback) {
            process.nextTick(function () {
                User.findOne({'local.email': email}, function (err, user) {
                    if (err) return callback(err);
                    if (user) {
                        return callback(null, false, req.flash('signupMessage', 'This email is already in use'));
                    } else {
                        var newUser = new User();
                        newUser.local.first = req.param('firstName');
                        newUser.local.last = req.param('lastName');
                        newUser.local.username = req.param('username');
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.songs = [];
                        newUser.save(function (err) {
                            if (err) throw err;
                            fs.mkdir( songsfolder + newUser._id , function(err) {
                                if (err) {
                                    throw err;
                                } else {
                                   console.log("Folder " + newUser._id + " has been created. ");
                                }
                            });
                            return callback(null, newUser);
                        });
                    }
                });
            });
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                if (err)
                    return done(err);

                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                return done(null, user);
            });

        }));

};
