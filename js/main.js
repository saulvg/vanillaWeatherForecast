'use strict';

const permission = document.querySelector('.permission');
const positive = document.querySelector('.positive');
const negative = document.querySelector('.negative');
const error = document.querySelector('.error');

const panels = [permission, positive, negative, error];
const API_KEY = '5463b56bf702eb77a5c1155cbb84a07e';
const RAIN_MARGIN = 4;

//Function that hides all panels
function hidePanel() {
  for (const panel of panels) {
    panel.classList.add('hidden');
  }
}

//Function that shows panels
function showPanel(panel) {
  hidePanel();
  panel.classList.remove('hidden');
}

//Function to make a remote call
async function getData({ url, options = {} }) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Errror('Error realizando peticion');
  }
  const data = await response.json();
  return data;
}
//Weather API call function 'https://openweathermap.org/api' and analyze if it rains
async function getWeatherData({ latitude, longitude }) {
  try {
    //Request current conditions from the API
    const currentWeather = await getData({
      url: `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
    });
    //Request conditions of the next hours to the API
    const nextHoursWeather = await getData({
      url: `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&exclude=current,minutely,daily,alert&units=metric`,
    });
    //Check if it rains in the next hours
    const nextRain = nextHoursWeather.hourly.findIndex((hour) => {
      return hour.weather[0].main === 'Rain';
    });

    //Function to show positive panel or negative panel
    function panelPositiveOrNegative(panel, rain) {
      showPanel(panel);

      const text = panel.querySelector('p');
      text.innerHTML = `
      Right now it's ${currentWeather.main.temp} degredes in ${
        currentWeather.name
      }, with ${currentWeather.weather[0].description} ${
        rain
          ? `and ${
              currentWeather.weather[0].main === 'Rain'
                ? `it's raining now`
                : `it seems that it will rain in ${nextRain + 1} hour${
                    nextRain + 1 === 1 ? '' : 's'
                  }.`
            }`
          : `and it doesn't seems that it will rain in the next ${RAIN_MARGIN} hours`
      }`;
    }
    if (nextRain > -1 && nextRain < RAIN_MARGIN) {
      panelPositiveOrNegative(positive, rain);
    } else {
      panelPositiveOrNegative(negative);
    }
  } catch (error) {
    showPanel(error);
  }
}

//Function to get user's location
function getUserLocation() {
  hidePanel();
  navigator.geolocation.getCurrentPosition(
    (location) => {
      const { latitude, longitude } = location.coords;
      getWeatherData({ latitude, longitude }); // ={longitude:longitude, la...}
    },
    () => {
      showPanel(error);
    }
  );
}

//Main function
function main() {
  showPanel(permission);

  const permissionButton = permission.querySelector('button');
  permission.addEventListener('click', getUserLocation);
}
main();
