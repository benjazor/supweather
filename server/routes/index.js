const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// Welcome page
router.get('/', (req, res, next) => {
    return res.render('index', {'title':'Index'});
});

// Dashboard
router.get('/profile', ensureAuthenticated, (req, res, next) => {
    return res.render('profile', {
        name: req.user.name
    });
});

// Throws an error
router.get('/throw', (req, res, next) => {
    throw new Error('This is a test');
});

module.exports = router;