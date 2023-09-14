import React, {useState} from "react";

function getWeatherIcon(wmoCode) {
    const icons = new Map([
        [[0], "☀️"],
        [[1], "🌤"],
        [[2], "⛅️"],
        [[3], "☁️"],
        [[45, 48], "🌫"],
        [[51, 56, 61, 66, 80], "🌦"],
        [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
        [[71, 73, 75, 77, 85, 86], "🌨"],
        [[95], "🌩"],
        [[96, 99], "⛈"],
    ]);
    const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
    if (!arr) return "NOT FOUND";
    return icons.get(arr);
}

function convertToFlag(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
    return new Intl.DateTimeFormat("en", {
        weekday: "short",
    }).format(new Date(dateStr));
}

const Input = ({ location, onChangeLocation }) => {
    return (
        <input
            type="text"
            placeholder="Search from location..."
            value={location}
            onChange={onChangeLocation}
        />
    );
};

const Weather = ({ weather, location }) => {
    const { temperature_2m_max: max, temperature_2m_min: min, time: dates, weathercode: codes } = weather;

    return (
        <div>
            <h2>Weather {location}</h2>
            <ul className="weather">
                {dates.map((date, i) => (
                    <Day
                        date={date}
                        max={max[i]}
                        min={min[i]}
                        code={codes[i]}
                        key={date}
                        isToday={i === 0}
                    />
                ))}
            </ul>
        </div>
    );
};

const Day = ({ date, max, min, code, isToday }) => {
    return (
        <li className="day">
            <span>{getWeatherIcon(code)}</span>
            <p>{isToday ? "Today" : formatDay(date)}</p>
            <p>
                {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
            </p>
        </li>
    );
};

const App = () => {
    const [location, setLocation] = useState("lisbon");
    const [isLoading, setIsLoading] = useState(false);
    const [displayLocation, setDisplayLocation] = useState("");
    const [weather, setWeather] = useState({});

    const fetchWeather = async () => {
        try {
            setIsLoading(true);

            const geoRes = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
            );
            const geoData = await geoRes.json();
            console.log(geoData);

            if (!geoData.results) throw new Error("Location not found");

            const { latitude, longitude, timezone, name, country_code } = geoData.results[0];

            setDisplayLocation(`${name} ${convertToFlag(country_code)}`);

            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
            );
            const weatherData = await weatherRes.json();
            setWeather(weatherData.daily);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app">
            <h1>Classy Weather</h1>
            <div>
                <Input location={location} onChangeLocation={(e) => setLocation(e.target.value)} />
            </div>
            <button onClick={fetchWeather}>Get weather</button>
            {isLoading && <p className="loader">Loading...</p>}
            {weather.weathercode && <Weather weather={weather} location={displayLocation} />}
        </div>
    );
};

export default App;