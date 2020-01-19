let citiesContainer = document.getElementById('citiesContainer');
let cityInput = document.getElementById('cityInput');
let cities = null;

/**********   Load city list from local JSON file   **********/
fetch('/city.list.json')
    .then(res => {
        return res.json();
    })
    .then(res => {
        console.log(res);
        cities = res;
    })
    .catch(err => console.log(err));

/**********   Search the city list with a query string and return a list of 5 or less cities   **********/
let searchList = (query) => {
    let result = [];

    for (let city of cities) {
        if ((city.name + " " + city.country).toLowerCase().includes(query.toLowerCase())) result.push(city);
        if (result.length > 4) break;
    }

    return result;
};

/**********   Updates the cities shown to the user   **********/
let updateCities = () => {
    console.log(Date.now().toString())
        // Loads the display list
    let displayList = searchList(cityInput.value);

    // Clear the current cities from display list
    while (citiesContainer.firstChild) { citiesContainer.removeChild(citiesContainer.firstChild); }

    for (let city of displayList) {
        var cityDisplayForm = document.createElement('form');
        var cityDisplayName = document.createElement('p');
        var cityDisplayButton = document.createElement('button');

        cityDisplayForm.action = '/add';
        cityDisplayForm.method = 'POST';

        cityDisplayName.textContent = city.name + ", " + city.country;

        cityDisplayButton.name = 'cityId';
        cityDisplayButton.type = 'submit';
        cityDisplayButton.value = city.id;
        cityDisplayButton.innerText = '+';

        citiesContainer.appendChild(cityDisplayForm);
        cityDisplayForm.appendChild(cityDisplayName);
        cityDisplayForm.appendChild(cityDisplayButton);
    }
};