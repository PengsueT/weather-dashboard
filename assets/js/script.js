const API_KEY = "4cb9901776250d6496f8d463e571e0e5"; // My API key
const LatLonURL = `https://api.openweathermap.org/geo/1.0/direct?limit=1&appid=${API_KEY}&q=`;
const ForecastURL = `https://api.openweathermap.org/data/2.5/forecast?units=imperial&appid=${API_KEY}`;
let cityArray = JSON.parse(localStorage.getItem("Cities")) || []; // Load cities from localStorage or an empty array
const buttonSearch = $("#search");
const todayCard = $(".today");
const cards = $(".cards");

// Fetching coordinates based on city name
async function searchCoords(cityInput) {
    const finalURL = `${LatLonURL}+${cityInput}`;
    const response = await fetch(finalURL);
    const coords = await response.json();

    // If no coordinates found this will alert the user that city isn't fount
    if (!coords.length) {
        alert("City not found!");
        return;
    }
    const { lat, lon, name } = coords[0];
    searchCity(name, lat, lon);
    return name;
}

// Fetching weather data using coordinates
async function searchCity(name, lat, lon) {
    const finalURL = `${ForecastURL}&lat=${lat}&lon=${lon}`;
    const response = await fetch(finalURL);
    const forecast = await response.json();

    // Handles today's weather forecast
    const todayForecast = forecast.list[0];
    const todayIcon = todayForecast.weather[0].icon;
    const todayTemp = todayForecast.main.temp;
    const todayHumidity = todayForecast.main.humidity;
    const todayWind = todayForecast.wind.speed;
    const weatherImgURL = `http://openweathermap.org/img/wn/${todayIcon}.png`;

    todayCard.empty();
    todayCard.append(`
        <div class="card-body">
            <h2 class="card-title">${name}</h2>
            <img src="${weatherImgURL}" alt="Weather Icon">
            <p>Temp: ${todayTemp}ºF</p>
            <p>Wind: ${todayWind} MPH</p>
            <p>Humidity: ${todayHumidity}%</p>
        </div>
    `);
    // Process and display the 5-day forecast
    const daysForecast = get5DayForecast(forecast.list);
    createForecastCards(daysForecast);
}

// Fetching the 5-day forecasts from that city
function get5DayForecast(list) {
    let finalList = [];
    let prevDay = null;
    list.forEach(forecast => {
        const dateObject = dayjs(forecast.dt_txt);
        const day = dateObject.date();
        const hour = dateObject.hour();

        // Adding the relevant forecast data (date, temp, humidity, icon, wind) to the final list
        if (hour === 12 && day !== prevDay) {
            prevDay = day;
            finalList.push({
                date: dateObject.format('MM/DD/YYYY'),
                temp: forecast.main.temp,
                humidity: forecast.main.humidity,
                icon: forecast.weather[0].icon,
                wind: forecast.wind.speed,
            });
        }
    })
    return finalList;
}

// Displaying the 5-day forecast cards
function createForecastCards(daysForecast) {
    cards.empty();

    daysForecast.forEach(forecast => {
        const weatherImgURL = `http://openweathermap.org/img/wn/${forecast.icon}.png`;

        // Creating Bootstrap card element with forecast data
        const cardDiv = $('<div>').addClass("card me-3").css("width", "18rem");
        const cardBody = $('<div>').addClass("card-body d-flex flex-column justify-content-between align-items-center");

        // Populating the card with forecast details (date, weather icon, temp, wind, humidity)
        cardBody.append(`
            <h3 class="card-title">${forecast.date}</h3>
            <img src="${weatherImgURL}" alt="Weather Icon">
            <p class="card-text">Temp: ${forecast.temp}ºF</p>
            <p class="card-text">Wind: ${forecast.wind} MPH</p>
            <p class="card-text">Humidity: ${forecast.humidity}%</p>
        `);

        cardDiv.append(cardBody);
        cards.append(cardDiv);
    });
}


// Creating search history buttons
function createCityButton(name) {
    if (!cityArray.includes(name)) {
        cityArray.push(name);
        localStorage.setItem("Cities", JSON.stringify(cityArray));

        const cityButton = $('<button>').addClass("btn btn-secondary w-100 mb-2").text(name);
        cityButton.on("click", () => searchCoords(name));
        $("#city-buttons").append(cityButton);
    }
}

// Initializing search history from localStorage
function initializeHistory() {
    cityArray.forEach(city => {
        const cityButton = $('<button>').addClass("btn btn-secondary w-100 mb-2").text(city);
        cityButton.on("click", () => searchCoords(city));
        $("#city-buttons").append(cityButton);
    });
}

// Updating handleButtonClicked to create city button
async function handleButtonClicked() {
    const cityInput = $("#input-city").val();
    if (!cityInput) {
        alert("Please enter a city name");
        return;
    }
    const cityName = await searchCoords(cityInput);
    createCityButton(cityName);
}

// Initialize on page load
$(document).ready(() => {
    initializeHistory();
    buttonSearch.on("click", handleButtonClicked);
});

// Triggering search on button click
buttonSearch.on("click", async () => {
    const cityInput = $("#input-city").val();
    if (!cityInput) {
        alert("Please enter a city name.");
        return;
    }
    await searchCoords(cityInput);
});
