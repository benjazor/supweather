const cities = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '../config/city.list.json'), 'utf8')); // List of cities from the OpenWeatherAPI
const daysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const request = require('request-promise');

class City {
    constructor() {}

    // Check if city id is in city list
    static inCityList(cityId) {
        let result = undefined;
        cities.forEach(city => {
            if (city.id == cityId) result = city;
        });
        return result;
    }

    // Return all data for home page
    static getCityToday(userCities, result, next) {
        let _userCities = userCities;
        let _result = result;
        if (userCities.length === 0) {
            return next(_result);
        } else {
            let city = this.inCityList(userCities[0]);
            if (city) {
                request({ // Request parameters
                        'method': 'GET',
                        'url': `https://api.openweathermap.org/data/2.5/weather?id=${city.id}&appid=${process.env.OPENWEATHER_API_KEY}`,
                        'json': true,
                        'headers': {}
                    })
                    .then(function(data) { // If the request is successful
                        _result.push(data);
                        _userCities.shift();
                        return City.getCityToday(_userCities, _result, next);
                    })
                    .catch(err => console.log(err));
            } else {
                return `City with id ${cityId} does not exists!`;
            }
        }
    }

    // Return a table containing all of the weather details for a city
    static processDetails(data) {
        let list = data.list // All the processing occures on the list element
        let results = []; // Results talbe [{day, icon, min, max},...]
        let days = []; // Temporary array to keep track of days
        let index = -1; // Index in the results table during processsing

        list.forEach(item => {
            // Get the current item's date
            let date = new Date(item.dt * 1000);

            // Process item for all the other days
            if (!days.includes(date.getDate())) { // Add a new item to the main array
                days.push(date.getDate()); // push
                results.push({
                    day: daysList[date.getUTCDay()],
                    min: 9999,
                    max: -9999
                });
                index++;

            } else { // Process Min, Max, Icon
                // Check and replace min if necessary
                if (item.main.temp_min < results[index].min) results[index].min = item.main.temp_min;
                // Check and replace max if necessary
                if (item.main.temp_max > results[index].max) results[index].max = item.main.temp_max;
                // Check and replace weather icon if necessary
                if (date.getUTCHours() <= 12 || date.getDate() === new Date().getDate()) {
                    results[index].description = item.weather[0].description;
                    results[index].icon = item.weather[0].icon;
                }
            }
        });
        return results;
    }

    static getUserCities = (userCityList) => {
        let result = [];
        for (let userCityId of userCityList) {
            result.push(cities.find(city => city.id == userCityId));
        }
        return result;
    }








    /*
        // Returns a boolean value telling if the city exists for the API
        static inCityList(name, country) {
            let _name = name.toLowerCase();
            let _country = country === undefined ? undefined : country.toLowerCase();
            let a = 0;
            cities.forEach(city => {
                if (city.name.toLowerCase() == _name && (country === undefined || city.country.toLowerCase() == _country)) a++;
            });
            return (a !== 0);
        }
     */

    /*
        // Returns the list of cities: [{value, placeholder},...]
        static getCityList() {
            let result = [];
            cities.forEach(city => {
                result.push({
                    value: city.name +'-'+ city.country,
                    placeholder: city.name +', '+ city.country
                });
            });
            return result;
        }
     */

    /*
        // Returns the list of cities: [{value, placeholder},...]
        static getCityId(name, country) {
            let _name = name.toLowerCase();
            let _country = country === undefined ? undefined : country.toLowerCase();
            let a = undefined;
            cities.forEach(city => {
                if (city.name.toLowerCase() == _name && (country === undefined || city.country.toLowerCase() == _country)) a=city.id;
            });
            return a;
        }
     */

    ///
}

module.exports = City;