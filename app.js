// Utility methods
//------------------------------------------------------------------------------
function onError(err) {
  console.log(err);
}

function getWeatherQuery(weatherData) {
  return weatherData.weather[0].main;
}

function createThumb(item) {
  const img = document.createElement("img");
  img.src = item.urls.thumb;
  img.className = "thumbs__link__img";

  return img;
}

function createThumbLink(item) {
  const anchor = document.createElement("a");
  anchor.href = item.links.html;
  anchor.className = "thumbs__link";
  anchor.appendChild(createThumb(item));

  return anchor;
}

function createThumbLinks(el, imageData) {
  const fragment = document.createDocumentFragment();
  imageData.forEach(item => fragment.appendChild(createThumbLink(item)));

  el.appendChild(fragment);

  return Array.from(el.children);
}

const getThumbClickFn = (imageData, updateUI) => i => updateUI(imageData[i]);

// APPLICATION
//------------------------------------------------------------------------------
function App(apis) {
  // Cache references to DOM elements
  const $body = document.querySelector("body");
  const $img = document.querySelector("#img");
  const $thumbs = document.querySelector("#thumbs");
  const $conditions = document.querySelector("#conditions");
  const $creditUser = document.querySelector("#credit-user");
  const $creditPlatform = document.querySelector("#credit-platform");

  $creditPlatform.href = `https://unsplash.com${apis.unsplash.utm}`;

  function updateUI({ urls, color, user }) {
    $img.src = urls.regular;
    $body.style.backgroundColor = color;
    $creditUser.href = user.links.html + apis.unsplash.utm;
    $creditUser.textContent = user.name;
  }

  // API: Step 1 - fetch weather data
  const fetchWeather = ({ key, url, query }) => {
    return fetch(`${url}?q=${query}&appid=${key}`)
      .then(res => res.json(), onError)
      .catch(onError);
  };

  // API: Step 2 - fetch weather-related images & return aggregated data
  function getFetchImageFn({ key, url }) {
    return function fetchImages(weatherData) {
      const query = getWeatherQuery(weatherData);

      return fetch(`${url}?query=${query}&client_id=${key}`)
        .then(res => res.json(), onError)
        .then(imageData => ({ weatherData, imageData }))
        .catch(onError);
    };
  }

  // API: Step 3 - All data loaded: build the UI
  function onImageData({ weatherData, imageData }) {
    const { results } = imageData;

    const onThumbClick = getThumbClickFn(results, updateUI);
    const thumbLinks = createThumbLinks($thumbs, results);

    // Event delegation means flexible event management
    $thumbs.addEventListener("click", function(event) {
      if (event.target.matches("a")) {
        event.preventDefault();

        onThumbClick(thumbLinks.indexOf(event.target));
      }
    });

    $conditions.textContent = getWeatherQuery(weatherData);

    onThumbClick(0);
  }

  // API: Step 0 - Make the request
  function fetchData(apis) {
    fetchWeather(apis.weather)
      .then(getFetchImageFn(apis.unsplash))
      .then(onImageData)
      .catch(onError);
  }

  // START! Load the initial data
  fetchData(apis);
}

new App({
  weather: {
    key: "a70fde74ccea0ae4b9d62142c9dece40",
    url: "http://api.openweathermap.org/data/2.5/weather",
    query: "London,uk"
  },
  unsplash: {
    key: "df24b455387acb47127898da32793c0e9b3a43b75af80a857feb17cffe4af7f0",
    url: "https://api.unsplash.com/search/photos",
    utm: "?utm_source=weather&utm_medium=referral&utm_campaign=api-credit"
  }
});
