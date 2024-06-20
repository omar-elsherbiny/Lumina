const KEY = 'baac031bcdaa4ae8b7b05039241606'; // :<
const currentInfo = document.getElementById('current-info');

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

function updateCurrentInfo() {
    let t = getScrollPercentage(currentInfo);
    currentInfo.style.backgroundColor = `color-mix(in lab, red ${lerp(0, 100, t)}%, blue)`;
    document.getElementById('day').style.color = `rgba(0,0,0,${lerp(1, 0, 2 * t)})`;
    document.getElementById('night').style.color = `rgba(0,0,0,${lerp(0, 1, 2 * t)})`;
}

updateCurrentInfo();
currentInfo.addEventListener('scroll', updateCurrentInfo);
// scroll animation