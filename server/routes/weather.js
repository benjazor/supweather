const express = require('express');
const router = express.Router();
const request = require('request-promise');
const City = require('../models/City');



/*** GET HANDLERS ***/
// Get a city weather data for today
router.get('/today/:city/:country?', (req, res, next) => {
    // Verify if the city exists
    if (City.inCityList(req.params.city, req.params.country)) {
        // Request the OpenWeatherAPI
        request({ // Request parameters
            'method': 'GET',
            'url': `https://api.openweathermap.org/data/2.5/weather?q=${req.params.city}${req.params.country ? ',' + req.params.country : ''}&appid=${process.env.OPENWEATHER_API_KEY}`,
            'json': true,
            'headers': {}
        })
            .then((data) => { // If the request is successful
                return res.render('weatherToday', data);
            })
            .catch((err) => { // Catch the error
                console.log(err);
                return res.send('Request error');
            });
    } else {
        // City not in the API
        return res.send('No no, there\'s an error');
    }
});


// Get details for a city weather
router.get('/details/:city/:country?', (req, res, next) => {
    // Verify if the city exists
    if (City.inCityList(req.params.city, req.params.country)) {
        // Request the OpenWeatherAPI
        request({ // Request parameters
            'method': 'GET',
            'url': `https://api.openweathermap.org/data/2.5/forecast?q=${req.params.city}${req.params.country ? ',' + req.params.country : ''}&mode=JSON&appid=${process.env.OPENWEATHER_API_KEY}`,
            'json': true,
            'headers': {}
        })
            .then((data) => { // If the request is successful
                return res.render('weatherDetails', { details: City.processDetails(data) });
            })
            .catch((err) => { // Catch the error
                console.log(err);
                return res.send('Request error');
            });
    } else {
        // City not in the API
        return res.send('No no, there\'s an error');
    }
});

module.exports = router;