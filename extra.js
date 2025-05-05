/**
 * Returns the current day of the week as a string.
 * @returns {string} The current day of the week (e.g., "Monday").
 */
function getCurrentDayString() {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDate = new Date();
    return daysOfWeek[currentDate.getDay()];
}

async function sendRequest(url, callback) {
    console.log(url);
    let res = await fetch(url, { method: "GET" })
    res = await res.json()
    callback(res);
}

function getFormattedDate() {
    const date = new Date();

    return `${date.getFullYear()}. ${date.getMonth()}. ${date.getDay}. ${getCurrentDayString()}`
}

function getFormattedTime() {
    const date = new Date();

    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

function genDatePrompt() {
    return `Current date is: ${getFormattedDate()}. Current time is: ${getFormattedTime()}`
}

/**
 * Parses the weather code from Open-Meteo API and returns a human-readable description.
 * @param {number} weatherCode - The weather code to parse.
 * @returns {string} A description of the weather condition.
 */
function parseWeatherCode(weatherCode) {
    const weatherDescriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Drizzle: Light",
        53: "Drizzle: Moderate",
        55: "Drizzle: Dense intensity",
        56: "Freezing Drizzle: Light",
        57: "Freezing Drizzle: Dense intensity",
        61: "Rain: Slight",
        63: "Rain: Moderate",
        65: "Rain: Heavy intensity",
        66: "Freezing Rain: Light",
        67: "Freezing Rain: Heavy intensity",
        71: "Snow fall: Slight",
        73: "Snow fall: Moderate",
        75: "Snow fall: Heavy intensity",
        77: "Snow grains",
        80: "Rain showers: Slight",
        81: "Rain showers: Moderate",
        82: "Rain showers: Violent",
        85: "Snow showers: Slight",
        86: "Snow showers: Heavy",
        95: "Thunderstorm: Slight or moderate",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    };

    return weatherDescriptions[weatherCode] || "Unknown weather condition";
}

/**
 * Fetches current weather information from Open-Meteo API.
 * @param {number} latitude - Latitude of the location.
 * @param {number} longitude - Longitude of the location.
 */
async function getCurrentWeather(latitude, longitude) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.current_weather) {
            const weather = data.current_weather;
            return `Temperature: ${weather.temperature}°C
            Wind Speed: ${weather.windspeed} km/h
            Weather Condition: ${parseWeatherCode(weather.weathercode)}`;
        } else {
            return "No current weather data available."
        }
    } catch (error) {
        return "Error fetching current weather information:" + error
    }
}

function getLocation(cityname) {
    return new Promise((resolved) => {
        const url = new URL("https://geocoding-api.open-meteo.com/v1/search?name=" + cityname + "&count=1&language=en&format=json").toString();
        sendRequest(url, (data) => {
            console.log(data);
            try {
                resolved(data["results"][0]);
            } catch (error) {
                resolved(error)
            }

        })
    });

}

function weatherInfo(city) {
    return new Promise(async (resolved) => {
        let locationInfo = await getLocation(city);
        console.log(locationInfo);


        let info = await getCurrentWeather(locationInfo.latitude, locationInfo.longitude);
        resolved(info);

    });
}

export {weatherInfo, getCurrentDayString, getCurrentWeather, getLocation, parseWeatherCode, sendRequest, genDatePrompt}