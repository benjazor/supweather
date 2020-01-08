const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const City = require('../models/City');


// Default redirection to home page
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/home'); // Default page for authenticated users
    } else {
        return res.redirect('/welcome'); // Default page for visitors
    }
});


router.get('/home', ensureAuthenticated, (req, res) => {
    City.getCityToday(req.user.cities, [],(cities) => {
        return res.render('default/home', { cities: cities });
    });
});

// Welcome page
router.get('/welcome', (req, res) => { return res.render('default/welcome'); });

module.exports = router;