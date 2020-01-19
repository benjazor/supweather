/**********   IMPORTS   **********/
require('dotenv').config(); // Load environment variables
const express = require('express');
const fs = require('fs');
const path = require('path');
// Security
const https = require('https'); // HTTPS
const RateLimit = require('express-rate-limit'); // DoS Protection
const helmet = require('helmet'); // HTTP headers protection

const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();


// Secure headers
app.use(helmet());


/**********   CONFIG   **********/
// Server port
const PORT = process.env.PORT || 8888;

// HTTPS config
const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, '/config/', 'server.crt')),
    key: fs.readFileSync(path.join(__dirname, '/config/', 'server.key'))
};

// Rate limit setup (DoS protection)
const limiter = new RateLimit({
    windowMS: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit number of request per IP
    delayMs: 0 // disable delays
});

// Passport config (Authentication)
require('./config/passport')(passport);

// MongoDB connection (Database)
mongoose.connect(process.env.DBURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {})
    .then(() => { console.log('MongoDB Connected...') })
    .catch((err) => console.log(err));



/***   MIDDLEWARE   ***/
// Template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(session({
    secret: 'supsun',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware (Authentication)
app.use(passport.initialize());
app.use(passport.session());

// Connect flash (Little messages when there is a redirection)
app.use(flash());

// Global Variables for messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// Allows server to receive JSON
app.use(express.json());

// Static files (images, css, javascript)
app.use(express.static('public'));



/**********   ROUTES   **********/
app.use(require('./routes/default.js')); // Default cases routes
app.use(require('./routes/user.js')); // User routes
app.use(require('./routes/city.js')); // Weather routes



/**********   ERROR HANDLER   **********/
if (app.get('env') !== 'developement') {
    app.use((err, req, res, next) => {
        return res.render('error');
    });
};



/**********   START SERVER   **********/
https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Server running on ${process.env.HOST}:${process.env.PORT}`);
});

module.export = app;