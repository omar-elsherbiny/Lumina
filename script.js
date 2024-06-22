const KEY = 'baac031bcdaa4ae8b7b05039241606'; // :<
const root = document.querySelector(':root');
const currentContainer = document.getElementById('current-container');
const infoContainer = document.getElementById('info-container');
const searchInput = document.getElementById('search-input');
const autocompleteBox = document.getElementById('autocomplete-box');

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
const nightMoonIcon = document.querySelectorAll('#night-moon-icon svg');
const moonDesc = document.getElementById('moon-desc');
const moonLumin = document.querySelectorAll('#moon-lumin .digit');
const visibility = document.querySelectorAll('#visibility .digit');
const sunrise = document.querySelectorAll('#sunrise .digit');
const sunset = document.querySelectorAll('#sunset .digit');
const moonrise = document.querySelectorAll('#moonrise .digit');
const moonset = document.querySelectorAll('#moonset .digit');

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
            result.push(`${datum.name}, ${datum.region}, ${datum.country}`)
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
    }
});
// unit switch

function getScrollPercentage(element) {
    const { scrollHeight, clientHeight, scrollTop } = element;
    const scrolledPortion = scrollHeight - clientHeight - scrollTop;
    const scrollPerc = scrolledPortion / (scrollHeight - clientHeight);
    return 1 - Math.max(Math.min(scrollPerc, 1), 0);
}

function lerp(a, b, moon_desc, capped = true) {
    if (capped) {
        moon_desc = Math.max(Math.min(moon_desc, 1), 0);
    }
    return ((1 - moon_desc) * a + moon_desc * b).toFixed(1);
}

function updateInfoContainer() {
    let moon_desc = getScrollPercentage(infoContainer);
    root.style.setProperty('--day-info-opacity', lerp(100, 0, moon_desc) + '%');
}

updateInfoContainer();
infoContainer.addEventListener('scroll', updateInfoContainer);
// scroll animation

let wd = null; // weather data
let is_day = 1;
async function applyNewWeatherData(location) {
    wd = await getWeather(location);
    let cu = document.documentElement.getAttribute('data-unit'); // current unit
    console.log(wd);

    let [cDate, cTime] = wd.location.localtime.split(' ');
    //let cTime = (new Date).toLocaleTimeString('en-US', { hour12: false });
    setClock(time, timeToArr(cTime));
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

    let astro = wd.forecast.forecastday[0].astro;
    setMoon(astro.moon_phase, astro.moon_illumination);
    moonDesc.innerHTML = astro.moon_phase;
    setClock(moonLumin, numToArr(astro.moon_illumination));

    setClock(visibility, numToArr(wd.current.vis_km, 2));
    setClock(sunrise, timeToArr(astro.sunrise));
    setClock(sunset, timeToArr(astro.sunset));
    setClock(moonrise, timeToArr(astro.moonrise));
    setClock(moonset, timeToArr(astro.moonset));

    setBarGradient(astro.sunrise, astro.sunset, astro.moonrise, astro.moonset);
    root.style.setProperty('--bar-selector-perc', timeToRatio(cTime))
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

function timeToArr(timeString) {
    const [hourString, minutes, meridian] = timeString.replace(' ', ':').split(':');
    let hour = parseInt(hourString, 10);
    if (meridian === 'PM' && hour !== 12) {
        hour += 12;
    } else if (meridian === 'AM' && hour === 12) {
        hour = 0;
    }
    const hour24 = hour.toString().padStart(2, ' ');
    const minutes24 = minutes.padStart(2, '0');
    return [hour24[0], ...hour24.slice(1), ...minutes24.split('')];
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
        let target = arr[dIndex];
        let currentNode = null;
        if (target != null) {
            for (let i = 0; i < options.length; i++) {
                const option = options[i];
                option.classList.remove('current');
                option.classList.remove('out');
                if (option.innerHTML < target) {
                    option.classList.add('out');
                } else if (option.innerHTML == target) {
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
setMoon('New Moon', 0);
// moon svg

function getDelayUntilNextMinute() {
    const now = new Date();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    return (60 * 1000) - (seconds * 1000 + milliseconds);
}

// setTimeout(function () {
//     if (prev_query != '') {
//         applyNewWeatherData(prev_query);
//     }
//     setInterval(() => {
//         if (prev_query != '') {
//             applyNewWeatherData(prev_query);
//         }
//     }, 60 * 1000);
// }, getDelayUntilNextMinute());