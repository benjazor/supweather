// Imports
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model
const User = require('../models/User');

module.exports = function(passport) {

    // Tells passport which strategy to use
    passport.use(
        // Create a Passport local strategy
        new LocalStrategy({ usernameField: 'email'}, (email, password, done) => {

            // Query the database to find one user with that email
            User.findOne({email: email})

                // When the query is done
                .then(user => {

                    // When there is no match (user with that email does not exists in database)
                    if (!user) {
                        return done(null, false, { message: 'Email incorrect' });
                    }

                    // Verify the password and the hashed password with bcrypt
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if(err) throw err;

                        // When the password is correct
                        if (isMatch) {
                            return done(null, user);

                        // When the password is wrong
                        } else {
                            return done(null, false, { message: 'Password incorrect' });
                        }
                    });
                })
                // Log the errors to the console
                .catch(err => console.log(err));
        })
    );

    // Code from Passport.js documentation (http://www.passportjs.org/docs/profile/)
    // Used for Sessions
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


}