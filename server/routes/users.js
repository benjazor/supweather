const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
const City = require('../models/City');


/*** GET HANDLERS ***/
// Authentication Page
router.get('/authentication', (req, res, next) => { return res.render('authentication'); });

// Profile Page
router.get('/profile', (req, res, next) => { return res.render('profile'); });

// Login Page
router.get('/login', (req, res, next) => { return res.render('login'); });

// Register Page
router.get('/register', (req, res, next) => { return res.render('register'); });

// Logout Handle
router.get('/logout', (req, res, next) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('login');
});

// Add City Page
router.get('/add-city', ensureAuthenticated, (req, res, next) => {
    return res.render('add-city', {cities: City.getCityList()});
});



/*** POST HANDLERS ***/
// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Register Handel
router.post('/register', (req, res, next) => {
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
        res.render('register', {
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
                    res.render('register', {
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
                                    req.flash('success_msg', 'You are now registered and can log in')
                                    // Redirect client to login page
                                    res.redirect('/users/login');
                                })
                                // When there was an error
                                .catch(err => console.log(err));
                    }));

                }
            });
    }

});

// Add City Handle
router.post('/add-city', ensureAuthenticated, (req, res, next) => {
    return res.send(req);
});

module.exports = router;