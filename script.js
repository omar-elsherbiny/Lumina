const KEY = 'baac031bcdaa4ae8b7b05039241606'; // :<
const root = document.querySelector(':root');
const currentContainer = document.getElementById('current-container');
const infoContainer = document.getElementById('info-container');
const searchInput = document.getElementById('search-input');
const autocompleteBox = document.getElementById('autocomplete-box');

const currentWeatherIcon = document.querySelector('#current-weather-icon img');
const currentTemp = document.querySelectorAll('#current-temp .digit');
const currentDesc = document.getElementById('current-desc');
const feelsLike = document.querySelectorAll('#feels-like .digit');
const humidity = document.querySelectorAll('#humidity .digit');
const uv = document.querySelectorAll('#uv .digit');
const wind = document.querySelectorAll('#wind .digit');
const clouds = document.querySelectorAll('#clouds .digit');
const rain = document.querySelectorAll('#rain .digit');
const snow = document.querySelectorAll('#snow .digit');

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

function lerp(a, b, t, capped = true) {
    if (capped) {
        t = Math.max(Math.min(t, 1), 0);
    }
    return ((1 - t) * a + t * b).toFixed(1);
}

function updateInfoContainer() {
    let t = getScrollPercentage(infoContainer);
    root.style.setProperty('--day-info-opacity', lerp(100, 0, t) + '%');
    // document.getElementById('night-moon-icon').style.transform = `translateX(-${lerp(400, 0, t)}%)`
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
    setClock(clouds, numToArr(wd.current.cloud));
    setClock(rain, numToArr(wd.forecast.forecastday[0].day.daily_chance_of_rain));
    setClock(snow, numToArr(wd.forecast.forecastday[0].day.daily_chance_of_snow));
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

function numToArr(num) {
    return num.toString().padStart(3, ' ').split('').map(char => char == ' ' ? ' ' : Number(char));
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
// let b = setBarGradient("06:00 AM", "06:00 PM", "10:00 PM", "7:00 AM");
// function cHeight(id) {
//     return document.getElementById(id).getBoundingClientRect().height;
// }
// document.getElementById('centered-night-info').style.paddingBottom= cHeight('info-container') - cHeight('centered-night-info') - cHeight('extended-night-info') + 'px';