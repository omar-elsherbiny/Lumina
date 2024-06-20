const KEY = 'baac031bcdaa4ae8b7b05039241606'; // :<
const root = document.querySelector(':root');
const infoContainer = document.getElementById('info-container');
const searchInput = document.getElementById('search-input');
const autocompleteBox = document.getElementById('autocomplete-box');

async function getWeather(location) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${KEY}&&q=${location}&days=3&aqi=no&alerts=no`);
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
}

updateInfoContainer();
infoContainer.addEventListener('scroll', updateInfoContainer);
// scroll animation

let weatherData;
async function updateWeatherData(searchIndex) {
    if (searches.length == 0) return;
    weatherData = await getWeather(searches[searchIndex]);
    console.log(weatherData);
    autocompleteBox.innerHTML = '';
    searches = [];
}

let searches = [];
async function updateAutocomplete(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        updateWeatherData(0);
    } else {
        searches = await searchLocation(searchInput.value.trim());
        autocompleteBox.innerHTML = '';
        searches.forEach(search_res => {
            let element = document.createElement('h5');
            element.innerHTML = search_res;
            autocompleteBox.appendChild(element);
        });
    }
}

searchInput.addEventListener('keyup', e => updateAutocomplete(e));
// search box 