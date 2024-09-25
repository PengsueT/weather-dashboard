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
    const todayIcon = todayForecast.weather[0].icon;
    const todayTemp = todayForecast.main.temp;
    const todayHumidity = todayForecast.main.humidity;
    const todayWind = todayForecast.wind.speed;
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

// we want to display the 5-day forecast cards
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


// Triggering search on button click
buttonSearch.on("click", async () => {
    const cityInput = $("#input-city").val();
    if (!cityInput) {
        alert("Please enter a city name.");
        return;
    }
    await searchCoords(cityInput);
});
