
// Shared JavaScript for all pages on the website.
// The code checks if an element exists before attaching features so one file can support multiple pages.

document.addEventListener('DOMContentLoaded', () => {
  setupTimer();
  setupGoalTracker();
  setupWeather();
  setupContactForm();
});

// Focus timer logic
function setupTimer() {
  const display = document.querySelector('.timer-value');
  const startBtn = document.getElementById('start-timer-btn');
  const pauseBtn = document.getElementById('pause-timer-btn');
  const resetBtn = document.getElementById('reset-timer-btn');

  if (!display || !startBtn || !pauseBtn || !resetBtn) return;

  let totalSeconds = 25 * 60;
  let timerId = null;

  function updateDisplay() {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    display.textContent = `${minutes}:${seconds}`;
  }

  function startTimer() {
    if (timerId) return;
    timerId = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds -= 1;
        updateDisplay();
      } else {
        clearInterval(timerId);
        timerId = null;
        display.textContent = 'Done!';
      }
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
  }

  function resetTimer() {
    pauseTimer();
    totalSeconds = 25 * 60;
    updateDisplay();
  }

  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);

  updateDisplay();
}

// Goal tracker with localStorage
function setupGoalTracker() {
  const goalForm = document.getElementById('goal-form');
  const goalInput = document.getElementById('goal-input');
  const goalList = document.getElementById('goal-list');

  if (!goalForm || !goalInput || !goalList) return;

  let goals = JSON.parse(localStorage.getItem('studentGoals')) || [];

  function renderGoals() {
    goalList.innerHTML = '';

    if (goals.length === 0) {
      goalList.innerHTML = '<li><span>No goals saved yet.</span></li>';
      return;
    }

    goals.forEach((goal, index) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <span>${goal}</span>
        <button type="button" aria-label="Remove goal ${goal}">Remove</button>
      `;

      const removeButton = listItem.querySelector('button');
      removeButton.addEventListener('click', () => {
        goals.splice(index, 1);
        localStorage.setItem('studentGoals', JSON.stringify(goals));
        renderGoals();
      });

      goalList.appendChild(listItem);
    });
  }

  goalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newGoal = goalInput.value.trim();

    if (!newGoal) return;

    goals.push(newGoal);
    localStorage.setItem('studentGoals', JSON.stringify(goals));
    goalInput.value = '';
    renderGoals();
  });

  renderGoals();
}

// External API integration using Open-Meteo geocoding + forecast
function setupWeather() {
  const weatherForm = document.getElementById('weather-form');
  const cityInput = document.getElementById('city-input');
  const weatherOutput = document.getElementById('weather-output');

  if (!weatherForm || !cityInput || !weatherOutput) return;

  weatherForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();
    if (!city) return;

    weatherOutput.textContent = 'Loading weather data...';

    try {
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        weatherOutput.innerHTML = '<p class="error-message">City not found. Try another location.</p>';
        return;
      }

      const place = geoData.results[0];
      const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`);
      const forecastData = await forecastResponse.json();
      const current = forecastData.current;

      weatherOutput.innerHTML = `
        <h3 class="h5">${place.name}, ${place.country}</h3>
        <p class="mb-1"><strong>Temperature:</strong> ${current.temperature_2m}&deg;F</p>
        <p class="mb-1"><strong>Wind speed:</strong> ${current.wind_speed_10m} mph</p>
        <p class="mb-0"><strong>Weather code:</strong> ${current.weather_code}</p>
      `;
    } catch (error) {
      weatherOutput.innerHTML = '<p class="error-message">Weather could not be loaded right now. Please try again later.</p>';
    }
  });
}

// Simple form validation
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (!contactForm || !formStatus) return;

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      formStatus.className = 'error-message mt-3 mb-0';
      formStatus.textContent = 'Please complete all fields before submitting.';
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      formStatus.className = 'error-message mt-3 mb-0';
      formStatus.textContent = 'Please enter a valid email address.';
      return;
    }

    formStatus.className = 'success-message mt-3 mb-0';
    formStatus.textContent = `Thanks, ${name}! This demo form was submitted successfully.`;
    contactForm.reset();
  });
}
