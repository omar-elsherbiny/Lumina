const KEY = 'baac031bcdaa4ae8b7b05039241606'; // :<
const root = document.querySelector(':root');
const infoContainer = document.getElementById('info-container');
const searchInput = document.getElementById('search-input');
const autocompleteBox = document.getElementById('autocomplete-box');

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
async function applyNewWeatherData(location) {
    weatherData = await getWeather(location);
    console.log(weatherData);
}

function confirmAutocomplete(searchIndex) {
    if (searches.length == 0) return;
    applyNewWeatherData(searches[searchIndex]);
    searchInput.value = searches[searchIndex];
    prev_query = searches[searchIndex];
    autocompleteBox.style.opacity = '0';
    let timeout = setTimeout(() => {
        autocompleteBox.innerHTML = '';
        clearTimeout(timeout);
    }, 200);
    searches = [];
    document.activeElement.blur();
}

let searches = [];
async function updateAutocomplete(e) {
    prev_query = searchInput.value;
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
let prev_query;
searchInput.addEventListener('focus', e => {
    prev_query = searchInput.value;
    searchInput.value = '';
    autocompleteBox.style.opacity = '0';
});
searchInput.addEventListener('focusout', e => {
    searchInput.value = prev_query;
    autocompleteBox.style.opacity = '1';
});
// search box 

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