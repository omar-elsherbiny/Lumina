const KEY = 'baac031bcdaa4ae8b7b05039241606'; // :<
const root = document.querySelector(':root');
const currentContainer = document.getElementById('current-container');
const infoContainer = document.getElementById('info-container');
const searchInput = document.getElementById('search-input');
const autocompleteBox = document.getElementById('autocomplete-box');
const locationOff = document.getElementById('location-off');
const locationOn = document.getElementById('location-on');

const date = document.querySelectorAll('#date .digit');
const time = document.querySelectorAll('#time .digit');
const currentWeatherIcon = document.querySelector('#current-weather-icon img');
const currentTemp = document.querySelectorAll('#current-temp .digit');
const currentDesc = document.getElementById('current-desc');
const feelsLike = document.querySelectorAll('#feels-like .digit');
const humidity = document.querySelectorAll('#humidity .digit');
const uv = document.querySelectorAll('#uv .digit');
const wind = document.querySelectorAll('#wind .digit');
const windDir = document.querySelectorAll('#wind-dir .digit');
const windDirIcon = document.getElementById('wind-dir-icon');
const clouds = document.querySelectorAll('#clouds .digit');
const rain = document.querySelectorAll('#rain .digit');
const snow = document.querySelectorAll('#snow .digit');
const totalSnow = document.querySelectorAll('#total-snow .digit');
const nightMoonIcon = document.querySelectorAll('#night-moon-icon svg');
const moonDesc = document.getElementById('moon-desc');
const moonLumin = document.querySelectorAll('#moon-lumin .digit');
const visibility = document.querySelectorAll('#visibility .digit');
const sunrise = document.querySelectorAll('#sunrise .digit');
const sunset = document.querySelectorAll('#sunset .digit');
const moonrise = document.querySelectorAll('#moonrise .digit');
const moonset = document.querySelectorAll('#moonset .digit');

const todayContainer = document.getElementById('today-container');
const todayHourContainer = document.querySelector('#today-container .hour-card-container');
const forcastContainer = document.querySelector('#forcast-container .hour-card-container');
const altCurrentContainer = document.getElementById('alt-current-container');
const altHourContainer = document.querySelector('#alt-current-container .hour-card-container');
const altContainerTitle = document.querySelector('#alt-current-container h4');

async function getWeather(location) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${location}&days=3&aqi=no&alerts=no`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function searchLocation(query) {
    try {
        if (query.length == 0) return [];
        const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=${KEY}&q=${query}`);
        const data = await response.json();
        let result = [];
        data.forEach(datum => {
            if (datum.region) {
                result.push(`${datum.name}, ${datum.region}, ${datum.country}`);
            } else {
                result.push(`${datum.name}, ${datum.country}`);
            }
        });
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}
// API handling

let themeToggle = document.getElementById('theme-toggle');
let storedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
if (storedTheme) {
    document.documentElement.setAttribute('data-theme', storedTheme)
    if (storedTheme === 'dark') {
        themeToggle.checked = true;
    }
    else {
        themeToggle.checked = false;
    }
}
themeToggle.addEventListener('click', function () {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let targetTheme = 'light';
    if (currentTheme === 'light') {
        targetTheme = 'dark';
    }
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
});
// theme switch

let unitToggle = document.getElementById('unit-toggle');
let storedUnit = localStorage.getItem('unit') || 'c';
if (storedUnit) {
    document.documentElement.setAttribute('data-unit', storedUnit)
    if (storedUnit === 'f') {
        unitToggle.checked = true;
    }
    else {
        unitToggle.checked = false;
    }
}
unitToggle.addEventListener('click', function () {
    let currentUnit = document.documentElement.getAttribute('data-unit');
    let targetUnit = 'c';
    if (currentUnit === 'c') {
        targetUnit = 'f';
    }
    document.documentElement.setAttribute('data-unit', targetUnit);
    localStorage.setItem('unit', targetUnit);

    if (wd != null) {
        setClock(currentTemp, tempToArr(wd.current[`temp_${targetUnit}`], targetUnit));
        setClock(feelsLike, tempToArr(wd.current[`feelslike_${targetUnit}`], targetUnit));

        document.querySelectorAll('#today-container .hour-card-temp').forEach((temp, index) => {
            let hour = wd.forecast.forecastday[0].hour[index];
            setClock(temp.querySelectorAll('.digit'), tempToArr(hour[`temp_${targetUnit}`], targetUnit));
        });
    }
});
// unit switch

let formatToggle = document.getElementById('format-toggle');
let storedFormat = localStorage.getItem('format') || '24';
if (storedFormat) {
    document.documentElement.setAttribute('data-format', storedFormat);
    if (storedFormat === '12') {
        formatToggle.checked = true;
    }
    else {
        formatToggle.checked = false;
    }
}
formatToggle.addEventListener('click', function () {
    let currentFormat = document.documentElement.getAttribute('data-format');
    let targetFormat = '24';
    if (currentFormat === '24') {
        targetFormat = '12';
    }
    document.documentElement.setAttribute('data-format', targetFormat);
    localStorage.setItem('format', targetFormat);

    if (wd != null) {
        setClock(time, timeToArr(wd.location.localtime.split(' ')[1], targetFormat));

        let astro = wd.forecast.forecastday[0].astro;
        setClock(visibility, numToArr(wd.current.vis_km, 2));
        setClock(sunrise, timeToArr(astro.sunrise, targetFormat));
        setClock(sunset, timeToArr(astro.sunset, targetFormat));
        setClock(moonrise, timeToArr(astro.moonrise, targetFormat));
        setClock(moonset, timeToArr(astro.moonset, targetFormat));

        document.querySelectorAll('.hour-card-val').forEach(time => {
            setClock(Array.from(time.querySelectorAll('.hour-card-val .digit')), [time.querySelectorAll('.hour-card-val .digit p')[targetFormat == '24' ? 0 : 1].textContent]);
        });
    }
});
// time format switch

function getLocation(search) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (search) {
                    searchLocation(`${position.coords.latitude}, ${position.coords.longitude}`).then(location => {
                        applyNewWeatherData(location);
                        searchInput.value = location;
                        prev_query = location;
                    });
                }
                locationOff.classList.add('hide');
                locationOn.classList.remove('hide');
            },
            (error) => {
                locationOff.classList.remove('hide');
                locationOn.classList.add('hide');
                console.error(error);
            }
        );
    } else {
        locationOff.classList.remove('hide');
        locationOn.classList.add('hide');
        console.error("Geolocation is not supported by this browser.");
    }
}

// current location

function getScrollPercentage(element) {
    const { scrollHeight, clientHeight, scrollTop } = element;
    const scrolledPortion = scrollHeight - clientHeight - scrollTop;
    const scrollPerc = scrolledPortion / (scrollHeight - clientHeight);
    return 1 - Math.max(Math.min(scrollPerc, 1), 0);
}

function lerp(a, b, t, capped = true) {
    if (capped) {
        t = Math.max(Math.min(t, 1), 0);
    }
    return ((1 - t) * a + t * b).toFixed(1);
}

function updateInfoContainer() {
    let t = getScrollPercentage(infoContainer);
    root.style.setProperty('--day-info-opacity', lerp(100, 0, t) + '%');
}

infoContainer.addEventListener('scroll', updateInfoContainer);
// scroll animation

function areObjectsDeepEqual(obj1, obj2) {
    if (Object.is(obj1, obj2)) { return true; }
    if (obj1 == null || typeof obj1 !== "object" || obj2 == null || typeof obj2 !== "object") {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) { return false; }
    for (const key of keys1) {
        if (!obj2.hasOwnProperty(key) || !areObjectsDeepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
}

let hourData = null;
let tomorrowData = null;
let afterTomorrowData = null;
let wd = null; // weather data
let is_day = 1;
async function applyNewWeatherData(location) {
    wd = await getWeather(location);
    let cu = document.documentElement.getAttribute('data-unit'); // current unit
    let cf = document.documentElement.getAttribute('data-format'); // current time format
    console.log(wd);

    let [cDate, cTime] = wd.location.localtime.split(' ');
    setClock(time, timeToArr(cTime, cf));
    setClock(date, dateToArr(cDate));

    if (is_day != wd.current.is_day) {
        currentContainer.classList.add('invis');
        let timeout = setTimeout(() => {
            if (wd.current.is_day) {
                root.style.setProperty('--day-info0', '#35deed80');
                root.style.setProperty('--day-info1', '#1ff20780');
            } else {
                root.style.setProperty('--day-info0', '#070c5080');
                root.style.setProperty('--day-info1', '#0b430580');
            }
            currentContainer.classList.remove('invis');
            clearTimeout(timeout);
            is_day = wd.current.is_day;
        }, 150);
    }

    currentWeatherIcon.src = 'https:' + wd.current.condition.icon.replace(/64x64/g, "128x128");
    setClock(currentTemp, tempToArr(wd.current[`temp_${cu}`], cu));
    currentDesc.innerHTML = wd.current.condition.text;

    setClock(feelsLike, tempToArr(wd.current[`feelslike_${cu}`], cu));
    setClock(humidity, Array.from(wd.current.humidity.toString()));
    setClock(uv, [wd.current.uv]);
    setClock(wind, tempToArr(wd.current.wind_kph));
    setClock(windDir, [wd.current.wind_dir]);
    windDirIcon.style.rotate = wd.current.wind_degree + 'deg';
    setClock(clouds, numToArr(wd.current.cloud));
    setClock(rain, numToArr(wd.forecast.forecastday[0].day.daily_chance_of_rain));
    setClock(snow, numToArr(wd.forecast.forecastday[0].day.daily_chance_of_snow));
    setClock(totalSnow, tempToArr(wd.forecast.forecastday[0].day.totalsnow_cm));

    let astro = wd.forecast.forecastday[0].astro;
    setMoon(astro.moon_phase, astro.moon_illumination);
    moonDesc.innerHTML = astro.moon_phase;
    setClock(moonLumin, numToArr(astro.moon_illumination));

    setClock(visibility, numToArr(wd.current.vis_km, 2));
    setClock(sunrise, timeToArr(astro.sunrise, cf));
    setClock(sunset, timeToArr(astro.sunset, cf));
    setClock(moonrise, timeToArr(astro.moonrise, cf));
    setClock(moonset, timeToArr(astro.moonset, cf));

    setBarGradient(astro.sunrise, astro.sunset, astro.moonrise, astro.moonset);
    root.style.setProperty('--bar-selector-perc', timeToRatio(cTime))

    if (!areObjectsDeepEqual(hourData, wd.forecast.forecastday[0].hour)) {
        hourData = wd.forecast.forecastday[0].hour;
        todayHourContainer.innerHTML = '';
        hourData.forEach((hour, index) => {
            let element = document.createElement('div');
            element.classList.add('hour-card');
            element.onclick = function () { this.classList.toggle("expanded") };
            element.style.animation = `fade-in 0.3s ${index * 90}ms ease-in-out forwards`;
            let timeout = setTimeout(() => {
                element.style.animation = '';
                element.style.opacity = '1';
                clearTimeout(timeout);
            }, index * 100 + 500);
            element.style.backgroundColor = `var(--card-bgr-${hour.is_day ? 'day' : 'night'})`;
            element.innerHTML = `
            <div class="hour-card-main">
                <div class="hour-card-val clock-digit-container">
                    <div class="digit">
                        <p class="current">${index.toString().padStart(2, '0')}:00</p>
                        <p>${index == 0 ? 12 : index}${index > 12 ? 'pm' : 'am'}</p>
                    </div>
                </div>
                <div class="hour-card-temp clock-digit-container">
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <p>.</p>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>°C</p>
                        <p>°F</p>
                    </div>
                </div>
                <div class="hour-card-weather-icon">
                    <img width="100%" height="100%"
                        src="https:${hour.condition.icon}" alt="Hour Weather Icon"></img>
                </div>
            </div>
            <div class="hour-card-extension">
                <div>
                    <svg class="hour-card-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="url(#grad5)" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="1.5"
                            d="M20.278 17.497c3.678-3.154-.214-7.384-4.256-7.384C13.175-.969-3.526 8.197 3.875 16.55" />
                    </svg>
                    <h5 class="hour-card-clouds">${hour.cloud}%</h5>
                </div>
                <div>
                    <svg class="hour-card-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="url(#grad2)" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="1.5"
                            d="M12.495 3c3.58 3.56 9.345 7.602 6.932 13.397C18.275 19.163 15.492 21 12.5 21c-2.992 0-5.775-1.837-6.927-4.603C3.161 10.607 8.919 6.561 12.495 3" />
                    </svg>
                    <h5 class="hour-card-humidity">${hour.humidity}%</h5>
                </div>
                <div>
                    <svg class="hour-card-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="url(#grad6)" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="1.5"
                            d="M12.004 19L12 14m4.004 7L16 16m-7.996 1L8 12m11.825 5c4.495-3.16.475-7.73-3.706-7.73C13.296-1.732-3.265 7.368 4.074 15.662" />
                    </svg>
                    <h5 class="hour-card-rain">${hour.chance_of_rain}%</h5>
                </div>
                <div>
                    <svg class="hour-card-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="url(#grad7)" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="1.5"
                            d="M12.004 17.5L12 17m4.004-1.5L16 15m-7.996.5L8 15m4.004 6L12 20.5m4.004-1.5L16 18.5m-7.996.5L8 18.5M19.825 17c4.495-3.16.475-7.73-3.706-7.73C13.296-1.732-3.265 7.368 4.074 15.662" />
                    </svg>
                    <h5 class="hour-card-snow">${hour.chance_of_snow}%</h5>
                </div>
            </div>`
            todayHourContainer.appendChild(element);
            setClock(Array.from(element.querySelectorAll('.hour-card-temp .digit')), tempToArr(hour[`temp_${cu}`], cu));
            setClock(Array.from(element.querySelectorAll('.hour-card-val .digit')), [element.querySelectorAll('.hour-card-val .digit p')[cf == '24' ? 0 : 1].textContent]);
        });
        let timeout = setTimeout(() => {
            setClock(Array.from(todayHourContainer.children[0].querySelectorAll('.hour-card-temp .digit')), tempToArr(hourData[0][`temp_${cu}`], cu));
            setClock(Array.from(todayHourContainer.children[0].querySelectorAll('.hour-card-val .digit')), [todayHourContainer.children[0].querySelectorAll('.hour-card-val .digit p')[cf == '24' ? 0 : 1].textContent]);
            clearTimeout(timeout);
        }, 500);
    }
    todayHourContainer.children[parseInt(cTime.substring(0, 2))].style.outline = '3pt solid var(--card-day-outline)';

    if (!areObjectsDeepEqual(tomorrowData, wd.forecast.forecastday[1]) || !areObjectsDeepEqual(afterTomorrowData, wd.forecast.forecastday[2])) {
        tomorrowData = wd.forecast.forecastday[1];
        afterTomorrowData = wd.forecast.forecastday[2];
        forcastContainer.innerHTML = `
        <div class="forcast-card" onclick="onForcastClick(1)">
            <div>
                <h4>Tomorrow</h4>
                <div class="forcast-card-temp clock-digit-container">
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <p>.</p>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>°C</p>
                        <p>°F</p>
                    </div>
                </div>
                <div class="forcast-card-weather-icon">
                    <img width="100%" height="100%"
                        src="https:${tomorrowData.day.condition.icon}"
                        alt="Forcast Weather Icon"></img>
                </div>
            </div>
            <div class="forcast-data">
                <div>
                    <svg class="forcast-card-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="url(#grad2)" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="1.5"
                            d="M12.495 3c3.58 3.56 9.345 7.602 6.932 13.397C18.275 19.163 15.492 21 12.5 21c-2.992 0-5.775-1.837-6.927-4.603C3.161 10.607 8.919 6.561 12.495 3" />
                    </svg>
                    <h5 class="forcast-card-humidity">${tomorrowData.day.avghumidity}%</h5>
                </div>
                <div>
                    <svg class="forcast-card-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="url(#grad6)" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="1.5"
                            d="M12.004 19L12 14m4.004 7L16 16m-7.996 1L8 12m11.825 5c4.495-3.16.475-7.73-3.706-7.73C13.296-1.732-3.265 7.368 4.074 15.662" />
                    </svg>
                    <h5 class="forcast-card-rain">${tomorrowData.day.daily_chance_of_rain}%</h5>
                </div>
                <div>
                    <svg class="forcast-card-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="url(#grad7)" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="1.5"
                            d="M12.004 17.5L12 17m4.004-1.5L16 15m-7.996.5L8 15m4.004 6L12 20.5m4.004-1.5L16 18.5m-7.996.5L8 18.5M19.825 17c4.495-3.16.475-7.73-3.706-7.73C13.296-1.732-3.265 7.368 4.074 15.662" />
                    </svg>
                    <h5 class="forcast-card-snow">${tomorrowData.day.daily_chance_of_snow}%</h5>
                </div>
            </div>
        </div>
        <div class="forcast-card" onclick="onForcastClick(2)">
            <div>
                <h4>After Tomorrow</h4>
                <div class="forcast-card-temp clock-digit-container">
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <p>.</p>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>0</p>
                        <p>1</p>
                        <p>2</p>
                        <p>3</p>
                        <p>4</p>
                        <p>5</p>
                        <p>6</p>
                        <p>7</p>
                        <p>8</p>
                        <p>9</p>
                    </div>
                    <div class="digit">
                        <p class="current">-</p>
                        <p>°C</p>
                        <p>°F</p>
                    </div>
                </div>
                <div class="forcast-card-weather-icon">
                    <img width="100%" height="100%"
                        src="https:${afterTomorrowData.day.condition.icon}"
                        alt="Forcast Weather Icon"></img>
                </div>
            </div>
            <div class="forcast-data">
                <div>
                    <svg class="forcast-card-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="url(#grad2)" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="1.5"
                            d="M12.495 3c3.58 3.56 9.345 7.602 6.932 13.397C18.275 19.163 15.492 21 12.5 21c-2.992 0-5.775-1.837-6.927-4.603C3.161 10.607 8.919 6.561 12.495 3" />
                    </svg>
                    <h5 class="forcast-card-humidity">${afterTomorrowData.day.avghumidity}%</h5>
                </div>
                <div>
                    <svg class="forcast-card-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="url(#grad6)" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="1.5"
                            d="M12.004 19L12 14m4.004 7L16 16m-7.996 1L8 12m11.825 5c4.495-3.16.475-7.73-3.706-7.73C13.296-1.732-3.265 7.368 4.074 15.662" />
                    </svg>
                    <h5 class="forcast-card-rain">${afterTomorrowData.day.daily_chance_of_rain}%</h5>
                </div>
                <div>
                    <svg class="forcast-card-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="url(#grad7)" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="1.5"
                            d="M12.004 17.5L12 17m4.004-1.5L16 15m-7.996.5L8 15m4.004 6L12 20.5m4.004-1.5L16 18.5m-7.996.5L8 18.5M19.825 17c4.495-3.16.475-7.73-3.706-7.73C13.296-1.732-3.265 7.368 4.074 15.662" />
                    </svg>
                    <h5 class="forcast-card-snow">${afterTomorrowData.day.daily_chance_of_snow}%</h5>
                </div>
            </div>
        </div>
    `
        setClock(document.querySelectorAll('.forcast-card-temp')[0].querySelectorAll('.digit'), tempToArr(tomorrowData.day['avgtemp_' + cu], cu));
        setClock(document.querySelectorAll('.forcast-card-temp')[1].querySelectorAll('.digit'), tempToArr(afterTomorrowData.day['avgtemp_' + cu], cu));
        let timeout = setTimeout(() => {
            setClock(document.querySelectorAll('.forcast-card-temp')[0].querySelectorAll('.digit'), tempToArr(tomorrowData.day['avgtemp_' + cu], cu));
            setClock(document.querySelectorAll('.forcast-card-temp')[1].querySelectorAll('.digit'), tempToArr(afterTomorrowData.day['avgtemp_' + cu], cu));
            clearTimeout(timeout);
        }, 500);
        onForcastClick(setDayIndex == null ? 1 : setDayIndex, false);
    }
}

function confirmAutocomplete(searchIndex) {
    if (searches.length == 0) return;
    applyNewWeatherData(searches[searchIndex]);
    document.activeElement.blur();
    searchInput.value = searches[searchIndex];
    prev_query = searches[searchIndex];
    autocompleteBox.style.opacity = '0';
    let timeout = setTimeout(() => {
        autocompleteBox.innerHTML = '';
        clearTimeout(timeout);
    }, 200);
    searches = [];
}

let searches = [];
async function updateAutocomplete(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        confirmAutocomplete(0);
    } else {
        searches = await searchLocation(searchInput.value.trim());
        autocompleteBox.innerHTML = '';
        searches.forEach((search_res, search_ind) => {
            let element = document.createElement('h5');
            element.innerHTML = search_res;
            element.onclick = () => { confirmAutocomplete(search_ind) };
            autocompleteBox.appendChild(element);
        });
    }
    autocompleteBox.style.opacity = `${searches.length == 0 ? 0 : 1}`;
}

searchInput.addEventListener('keyup', e => updateAutocomplete(e));
let prev_query = '';
searchInput.addEventListener('focus', e => {
    searchInput.value = '';
    autocompleteBox.style.opacity = '0';
});
searchInput.addEventListener('focusout', e => {
    searchInput.value = prev_query;
    autocompleteBox.style.opacity = '0';
});
// search box 

function dateToArr(dateString) {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: 'long' });
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let res = [dayOfWeek];
    res = res.concat(numToArr(day, 2)).concat(numToArr(month, 2, '0')).concat(numToArr(year, 1));
    return res;
}

function timeToArr(timeString, format) {
    const [hourString, minutes, meridian] = timeString.replace(' ', ':').split(':');
    let hour = parseInt(hourString, 10);
    if (meridian === 'PM' && hour !== 12) {
        hour += 12;
    } else if (meridian === 'AM' && hour === 12) {
        hour = 0;
    }
    const unit = format == '24' ? ' ' : (hour > 12 ? 'pm' : 'am');
    if (format == '12' && hour > 12) {
        hour -= 12;
    }
    const hour24 = hour.toString().padStart(2, ' ');
    const minutes24 = minutes.padStart(2, '0');
    return [hour24[0], ...hour24.slice(1), ...minutes24.split(''), unit];
}

function numToArr(num, pad = 3, padder = ' ') {
    return num.toString().padStart(pad, padder).split('').map(char => char == ' ' ? ' ' : Number(char));
}

function tempToArr(temp, unit) {
    const parts = temp.toString().split(".");
    let intStr = parts[0];
    intStr = intStr.padStart(3, " ");
    let decStr = "0";
    if (parts.length > 1) {
        decStr = parts[1].slice(0, 2);
    }
    let arr = [...intStr].concat(decStr.split(""));
    if (unit != null) arr.push(unit == 'c' ? '°C' : '°F');
    return arr;
}

function setClock(digits, arr) {
    digits.forEach((digit, dIndex) => {
        let options = digit.children;
        let target = arr[dIndex].toString();
        let currentNode = null;
        if (target != null) {
            for (let i = 0; i < options.length; i++) {
                const option = options[i];
                option.classList.remove('current');
                option.classList.remove('out');
                if (option.textContent < target) {
                    option.classList.add('out');
                } else if (option.textContent == target) {
                    option.classList.add('current');
                    currentNode = option;
                }
            }
            digit.style.width = currentNode == null ? 0 : currentNode.getBoundingClientRect().width + 'px';
        }
    });
}
// clock digits

function timeToRatio(timeString) {
    const [hours, minutes, period] = timeString.split(/[:\s]/);
    let hourValue = parseInt(hours, 10);
    if (period === "PM" && hourValue !== 12) {
        hourValue += 12;
    } else if (period === "AM" && hourValue === 12) {
        hourValue = 0;
    }
    let ratio24 = hourValue + parseFloat(minutes, 10) / 60;
    let ratio24centered = (ratio24 + 12) % 24;
    let ratio100centered = (ratio24centered * 100 / 24)
    return ratio100centered.toFixed(1) + '%';
}

const percentageGap = 1;
function setBarGradient(sunrise, sunset, moonrise, moonset) {
    root.style.setProperty('--bar-sunrise', timeToRatio(sunrise))
    root.style.setProperty('--bar-sunset', timeToRatio(sunset))
    root.style.setProperty('--bar-moonrise', timeToRatio(moonrise))
    root.style.setProperty('--bar-moonset', timeToRatio(moonset))
}

// day cycle bar

function setMoon(moon_desc, moon_illum) {
    let ind;
    if (moon_desc == 'New Moon') ind = 0;
    if (moon_desc == 'Waxing Crescent') ind = Math.round(0.1 * moon_illum + 1);
    if (moon_desc == 'First Quarter') ind = 7;
    if (moon_desc == 'Waxing Gibbous') ind = 2 + Math.round(0.1 * moon_illum + 1);
    if (moon_desc == 'Full Moon') ind = 14;
    if (moon_desc == 'Waning Gibbous') ind = 26 - Math.round(0.1 * moon_illum + 1);
    if (moon_desc == 'Third Quarter') ind = 21;
    if (moon_desc == 'Waning Crescent') ind = 28 - Math.round(0.1 * moon_illum + 1);

    nightMoonIcon.forEach(svg => {
        svg.style.top = '100%';
    });
    nightMoonIcon[ind].style.top = '0';
}
// moon svg

let panelTransformed = 0;
let setDayIndex = null;
function onForcastClick(dayIndex, animate = true) {
    if (wd == null) return;
    let query = getComputedStyle(root).getPropertyValue('--media-query');
    if (setDayIndex == dayIndex) {
        if (query == 0 && animate) {
            if (panelTransformed) {
                currentContainer.style.transform = '';
                todayContainer.style.transitionDelay = '1s';
                todayContainer.style.opacity = '1';
                altCurrentContainer.style.transitionDelay = '0s';
                altCurrentContainer.style.opacity = '0';
                panelTransformed = 0;
            } else {
                currentContainer.style.transform = 'translateX(100%)';
                todayContainer.style.transitionDelay = '0s';
                todayContainer.style.opacity = '0';
                altCurrentContainer.style.transitionDelay = '1s';
                altCurrentContainer.style.opacity = '1';
                panelTransformed = 1;
            }
        }
    } else {
        altContainerTitle.textContent = document.querySelectorAll('.forcast-card')[dayIndex - 1].querySelector('h4').textContent;
        if (query == 0 && animate) {
            currentContainer.style.transform = 'translateX(100%)';
            todayContainer.style.transitionDelay = '0s';
            todayContainer.style.opacity = '0';
            altCurrentContainer.style.transitionDelay = '1s';
            altCurrentContainer.style.opacity = '1';
            panelTransformed = 1;
        }
    }
    if (setDayIndex != dayIndex || !animate) {

        setDayIndex = dayIndex;
        let cu = document.documentElement.getAttribute('data-unit'); // current unit
        let cf = document.documentElement.getAttribute('data-format'); // current time format
        let tHourData = wd.forecast.forecastday[dayIndex].hour;
        altHourContainer.innerHTML = '';
        tHourData.forEach((hour, index) => {
            let element = document.createElement('div');
            element.classList.add('hour-card');
            element.onclick = function () { this.classList.toggle("expanded") };
            element.style.animation = `fade-in 0.3s ${index * 90}ms ease-in-out forwards`;
            let timeout = setTimeout(() => {
                element.style.animation = '';
                element.style.opacity = '1';
                clearTimeout(timeout);
            }, index * 100 + 500);
            element.style.backgroundColor = `var(--card-bgr-${hour.is_day ? 'day' : 'night'})`;
            element.innerHTML = `
                <div class="hour-card-main">
                    <div class="hour-card-val clock-digit-container">
                        <div class="digit">
                            <p class="current">${index.toString().padStart(2, '0')}:00</p>
                            <p>${index == 0 ? 12 : index}${index > 12 ? 'pm' : 'am'}</p>
                        </div>
                    </div>
                    <div class="hour-card-temp clock-digit-container">
                        <div class="digit">
                            <p class="current">-</p>
                            <p>0</p>
                            <p>1</p>
                            <p>2</p>
                            <p>3</p>
                            <p>4</p>
                            <p>5</p>
                            <p>6</p>
                            <p>7</p>
                            <p>8</p>
                            <p>9</p>
                        </div>
                        <div class="digit">
                            <p class="current">-</p>
                            <p>0</p>
                            <p>1</p>
                            <p>2</p>
                            <p>3</p>
                            <p>4</p>
                            <p>5</p>
                            <p>6</p>
                            <p>7</p>
                            <p>8</p>
                            <p>9</p>
                        </div>
                        <div class="digit">
                            <p class="current">-</p>
                            <p>0</p>
                            <p>1</p>
                            <p>2</p>
                            <p>3</p>
                            <p>4</p>
                            <p>5</p>
                            <p>6</p>
                            <p>7</p>
                            <p>8</p>
                            <p>9</p>
                        </div>
                        <p>.</p>
                        <div class="digit">
                            <p class="current">-</p>
                            <p>0</p>
                            <p>1</p>
                            <p>2</p>
                            <p>3</p>
                            <p>4</p>
                            <p>5</p>
                            <p>6</p>
                            <p>7</p>
                            <p>8</p>
                            <p>9</p>
                        </div>
                        <div class="digit">
                            <p class="current">-</p>
                            <p>°C</p>
                            <p>°F</p>
                        </div>
                    </div>
                    <div class="hour-card-weather-icon">
                        <img width="100%" height="100%"
                            src="https:${hour.condition.icon}" alt="Hour Weather Icon"></img>
                    </div>
                </div>
                <div class="hour-card-extension">
                    <div>
                        <svg class="hour-card-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                            viewBox="0 0 24 24">
                            <path fill="none" stroke="url(#grad5)" stroke-linecap="round"
                                stroke-linejoin="round" stroke-width="1.5"
                                d="M20.278 17.497c3.678-3.154-.214-7.384-4.256-7.384C13.175-.969-3.526 8.197 3.875 16.55" />
                        </svg>
                        <h5 class="hour-card-clouds">${hour.cloud}%</h5>
                    </div>
                    <div>
                        <svg class="hour-card-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                            viewBox="0 0 24 24">
                            <path fill="none" stroke="url(#grad2)" stroke-linecap="round"
                                stroke-linejoin="round" stroke-width="1.5"
                                d="M12.495 3c3.58 3.56 9.345 7.602 6.932 13.397C18.275 19.163 15.492 21 12.5 21c-2.992 0-5.775-1.837-6.927-4.603C3.161 10.607 8.919 6.561 12.495 3" />
                        </svg>
                        <h5 class="hour-card-humidity">${hour.humidity}%</h5>
                    </div>
                    <div>
                        <svg class="hour-card-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                            viewBox="0 0 24 24">
                            <path fill="none" stroke="url(#grad6)" stroke-linecap="round"
                                stroke-linejoin="round" stroke-width="1.5"
                                d="M12.004 19L12 14m4.004 7L16 16m-7.996 1L8 12m11.825 5c4.495-3.16.475-7.73-3.706-7.73C13.296-1.732-3.265 7.368 4.074 15.662" />
                        </svg>
                        <h5 class="hour-card-rain">${hour.chance_of_rain}%</h5>
                    </div>
                    <div>
                        <svg class="hour-card-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                            viewBox="0 0 24 24">
                            <path fill="none" stroke="url(#grad7)" stroke-linecap="round"
                                stroke-linejoin="round" stroke-width="1.5"
                                d="M12.004 17.5L12 17m4.004-1.5L16 15m-7.996.5L8 15m4.004 6L12 20.5m4.004-1.5L16 18.5m-7.996.5L8 18.5M19.825 17c4.495-3.16.475-7.73-3.706-7.73C13.296-1.732-3.265 7.368 4.074 15.662" />
                        </svg>
                        <h5 class="hour-card-snow">${hour.chance_of_snow}%</h5>
                    </div>
                </div>`
            altHourContainer.appendChild(element);
            setClock(Array.from(element.querySelectorAll('.hour-card-temp .digit')), tempToArr(hour[`temp_${cu}`], cu));
            setClock(Array.from(element.querySelectorAll('.hour-card-val .digit')), [element.querySelectorAll('.hour-card-val .digit p')[cf == '24' ? 0 : 1].textContent]);
        });
        let timeout = setTimeout(() => {
            setClock(Array.from(altHourContainer.children[0].querySelectorAll('.hour-card-temp .digit')), tempToArr(tHourData[0][`temp_${cu}`], cu));
            setClock(Array.from(altHourContainer.children[0].querySelectorAll('.hour-card-val .digit')), [altHourContainer.children[0].querySelectorAll('.hour-card-val .digit p')[cf == '24' ? 0 : 1].textContent]);
            clearTimeout(timeout);
        }, 500);
    }
}

// forcast functionality

if (navigator.userAgent.includes('Firefox')) {
    document.querySelectorAll('.scroll').forEach(element => {
        element.classList.add('scroll-moz');
    });
}

updateInfoContainer();
setMoon('New Moon', 0);

function getDelayUntilNextMinute() {
    const now = new Date();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    return (60 * 1000) - (seconds * 1000 + milliseconds);
}

setTimeout(function () {
    if (prev_query != '') {
        applyNewWeatherData(prev_query);
    }
    setInterval(() => {
        if (prev_query != '') {
            applyNewWeatherData(prev_query);
        }
    }, 60 * 1000);
}, getDelayUntilNextMinute());

// main run