const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
const City = require('../models/City');



/**********   LOGIN   **********/
// Login Page
router.get('/login', (req, res, next) => { return res.render('authentication/login'); });
// Login Handler
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});



/**********   LOGOUT   **********/
// Logout Handle
router.get('/logout', ensureAuthenticated, (req, res, next) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    return res.redirect('login');
});



/**********   REGISTER   **********/
// Register Page
router.get('/register', (req, res) => { return res.render('authentication/register'); });
// Register Handler
router.post('/register', (req, res) => {
    const { name, email, confirmationemail, password, confirmationpassword} = req.body;
    let errors = [];

    //Check required fields
    if(!name || !email || !confirmationemail || !password || !confirmationpassword) {
        errors.push({ msg : 'Please fill in all fields' });
    }

    // Check email match
    if (email !== confirmationemail) {
        errors.push({ msg : 'Emails do not match' });
    }

    // Check password match
    if (password !== confirmationpassword) {
        errors.push({ msg : 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 8) {
        errors.push({ msg : 'Passwords should be at least 8 characters' });
    }

    if (errors.length > 0){
        res.render('authentication/register', {
            // Send all data back to the form (expect password for security reasons)
            errors,
            name,
            email,
            confirmationemail
        });
    } else {
        // Validation passed
        User.findOne({email: email}) // Search database to see if the email is already used
            .then(user => {
                if(user) {
                    // User exists
                    errors.push({msg: 'Email is already used'})
                    res.render('authentication/register', {
                        errors,
                        name,
                        email,
                        confirmationemail
                    });
                } else {
                    // Create the new user
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) =>  {
                            if (err) throw err;
                            // Replace the plain text password to a hashed one
                            newUser.password = hash;
                            // Save the new user into the database
                            newUser.save()
                                // When the new user has been saved successfully into the database
                                .then(user => {
                                    // Send flash message
                                    req.flash('success_msg', 'You are now registered')
                                    // Redirect client to login page
                                    res.redirect('/login');
                                })
                                // When there was an error
                                .catch(err => console.log(err));
                        }));

                }
            });
    }

});



/**********   THEME   **********/
// Return the value of THEME
router.get('/theme', (req, res) => {
    if (req.isAuthenticated()) {
        res.status = 200;
        return res.send(req.user.theme);
    } else {
        res.status = 401;
        return res.send('Unauthorized');
    }
});
// Change value of user's theme
router.post('/theme', (req, res) => {
    if (req.isAuthenticated()) {
        if (typeof req.body.theme === 'boolean') {
            req.user.theme = req.body.theme; // Change the theme in db
            req.user.save(); // save in db
            res.status = 200;
            return res.send('OK');
        } else {
            res.status = 400;
            return res.send('Bad Request');
        }
    } else {
        res.status = 401;
        return res.send('Unauthorized');
    }
});


module.exports = router;