const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const request = require('request-promise');

// Models
const City = require('../models/City');
const User = require('../models/User');



/**********   ADD CITY   **********/
// Add city Page
router.get('/add', ensureAuthenticated, (req, res, next) => { return res.render('city/add'); });
// Add city Handle
router.post('/add', ensureAuthenticated, (req, res) => {
    // Check if value is correct
    let city = City.inCityList(req.body.cityId); // Check if provided id exists and return its city
    if (city) { // Verify that the city exists
        if (!req.user.cities.includes(req.body.cityId.toString())) { // Verify that the user is not trying to add a city a second time
            // Push the city id to the user's city array
            req.user.cities.push(city.id);
            req.user.save(); // Save in database
            // Returns user to home page with splash message
            req.flash('success_msg', `${city.name}, ${city.country} has been added.`);
            return res.redirect('home');
        } else {
            // Returns user to home page with splash message
            req.flash('error_msg', `${city.name}, ${city.country} is already on your profile!`);
            return res.redirect('home');
        }
    } else {
        // Returns user to home page with splash message
        req.flash('error_msg', 'The city you tried to add does not exists in our database!');
        return res.redirect('home');
    }
});



/**********   DELETE CITY   **********/
// Delete City Page
router.get('/delete', ensureAuthenticated, (req, res) => { return res.render('city/delete'); });
// Delete City Handle
router.post('/delete', ensureAuthenticated, (req, res) => {

    let city = City.inCityList(req.body.cityId);
    if (city) { // Verify that the city exists
        if (req.user.cities.includes(req.body.cityId.toString())) { // Verify that the user is not trying to add a city a second time
            // Removes the city from the users list
            let cities = req.user.cities;
            for (i = 0; i < cities.length; i++) {
                if (cities[i] == req.body.cityId) {
                    cities.splice(cities.indexOf(req.body.cityId), 1);
                    i--;
                }
            }
            req.user.save(); // Save in database
            // Returns user to home page with splash message
            req.flash('success_msg', `${city.name}, ${city.country} has been deleted.`);
            return res.redirect('home');
        } else {
            // Returns user to home page with splash message
            req.flash('error_msg', `${city.name}, ${city.country} is not on your profile, so you can't delete it!`);
            return res.redirect('home');
        }
    } else {
        // Returns user to home page with splash message
        req.flash('error_msg', 'The city you tried to delete does not exists in our database!');
        return res.redirect('home');
    }
});

/**********   CITY DETAILS   **********/
/*
router.get('/details/:cityId?', ensureAuthenticated, (req, res) => {
    let city = City.inCityList(cityId)
    if (cityId) {

    }
});
 */
// Get details for a city weather
router.get('/details/:cityId?', (req, res, next) => {
    // Verify if the city exists
    let city = City.inCityList(req.params.cityId);
    if (city) {
        request({ // Request parameters
            'method': 'GET',
            'url': `https://api.openweathermap.org/data/2.5/forecast?id=${city.id}&mode=JSON&appid=${process.env.OPENWEATHER_API_KEY}`,
            'json': true,
            'headers': {}
        })
            .then((data) => { // If the request is successful
                return res.render('city/details', { details: City.processDetails(data) });
            })
            .catch((err) => { // Catch the error
                console.log(err);
                return res.send('Request error');
            });
    } else {
        return res.send('Request error');
    }
});

module.exports = router;