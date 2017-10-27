const $body = document.querySelector("body");
const $btn = document.querySelector("#moar-btn");
const $img = document.querySelector("#img");
const $creditUser = document.querySelector("#credit-user");
const $creditPlatform = document.querySelector("#credit-platform");

const apis = {
  weather: {
    key: "a70fde74ccea0ae4b9d62142c9dece40"
  },
  unsplash: {
    key: "df24b455387acb47127898da32793c0e9b3a43b75af80a857feb17cffe4af7f0",
    utm: "?utm_source=weather&utm_medium=referral&utm_campaign=api-credit"
  }
};

// Utility methods
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}

function onError(err) {
  console.log(err);
}

// APPLICATION
// Step 1
const fetchWeather = () => {
  const key = apis.weather.key;
  const url = "http://api.openweathermap.org/data/2.5/weather";
  const query = "London,uk";

  fetch(url + "?q=" + query + "&appid=" + key)
    .then(function(res) {
      return res.json();
    }, onError)
    .then(fetchImages)
    .catch(onError);
};

// Step 2
function fetchImages(json) {
  const key = apis.unsplash.key;
  const url = "https://api.unsplash.com/photos/";
  const query = json.weather[0].main;

  fetch(url + "?query=" + query + "&client_id=" + key)
    .then(res => res.json(), onError)
    .then(displayImage)
    .catch(onError);
}

// Step 3
function displayImage(json) {
  const index = getRandomInt(0, json.length);
  const image = json[index];

  $img.src = image.urls.full;
  $body.style["backgroundColor"] = image.color;
  $creditUser.href = image.user.links.html + apis.unsplash.utm;
  $creditUser.textContent = image.user.name;
}

// START!
(function() {
  $creditPlatform.href = "https://unsplash.com/" + apis.unsplash.utm;
  $btn.addEventListener("click", fetchWeather);
  fetchWeather();
})();
