const API_KEY = "4cb9901776250d6496f8d463e571e0e5"; // My API key
const LatLonURL = `http://api.openweathermap.org/geo/1.0/direct?limit=1&appid=${API_KEY}&q=`;
const ForecastURL = `http://api.openweathermap.org/data/2.5/forecast?units=imperial&appid=${API_KEY}`;

const buttonSearch = $("#search");
const todayCard = $(".today");
const cards = $(".cards");

// Fetching coordinates based on city name
async function searchCoords(cityInput) {
    const finalURL = `${LatLonURL}+${cityInput}`;
    const response = await fetch(finalURL);
    const coords = await response.json();
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

    const todayForecast = forecast.list[0];
    const todayTemp = todayForecast.main.temp;
    const todayHumidity = todayForecast.main.humidity;
    const todayWind = todayForecast.wind.speed;
    const todayIcon = todayForecast.weather[0].icon;

    const weatherImgURL = `http://openweathermap.org/img/wn/${todayIcon}.png`;

    todayCard.empty();
    todayCard.append(`
        <div class="card-body mb-3">
            <h2 class="card-title">${name}</h2>
            <img src="${weatherImgURL}" alt="Weather Icon">
            <p>Temp: ${todayTemp}ºF</p>
            <p>Wind: ${todayWind} MPH</p>
            <p>Humidity: ${todayHumidity}%</p>
        </div>
    `);
}

// Triggering search on button click
buttonSearch.on("click", async () => {
    const cityInput = $("#input-city").val();
    if (!cityInput) {
        alert("Please enter a city name.");
        return;
    }
    await searchCoords(cityInput);
});
