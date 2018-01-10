// Utility methods
//------------------------------------------------------------------------------
function onError(err) {
  console.log(err);
}

function getWeatherConditions(weatherData) {
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

  el.innerHTML = "";
  el.appendChild(fragment);

  return Array.from(el.children);
}

// Bonus: let's add a bit of animation to smooth transitions between images :)
function loadMainImage(el, url) {
  const img = document.createElement("img");

  function onLoaded() {
    img.removeEventListener("load", onLoaded);
    el.innerHTML = "";
    el.appendChild(img);
  }

  img.addEventListener("load", onLoaded);
  img.src = url;
}

const getThumbClickFn = (imageData, conditions, updateUI) => index =>
  updateUI(conditions, imageData[index]);

// APPLICATION
//------------------------------------------------------------------------------
function App(apis) {
  // Cache references to DOM elements
  const $body = document.querySelector("body");
  const $photo = document.querySelector("#photo");
  const $thumbs = document.querySelector("#thumbs");
  const $conditions = document.querySelector("#conditions");
  const $creditUser = document.querySelector("#credit-user");
  const $creditPlatform = document.querySelector("#credit-platform");
  const $searchForm = document.querySelector("#search");
  const $searchField = document.querySelector("#search-tf");

  $searchField.value = apis.weather.query;
  $creditPlatform.href = `https://unsplash.com${apis.unsplash.utm}`;

  function updateUI(coditions, image) {
    const { urls, color, user } = image;

    loadMainImage($photo, urls.regular);

    $body.style.backgroundColor = color;
    $conditions.textContent = coditions;
    $creditUser.href = user.links.html + apis.unsplash.utm;
    $creditUser.textContent = user.name;
  }

  const getFetchFn = apis => {
    const fetchWeather = getFetchWeatherFn(apis.weather);
    const fetchImages = getFetchImageFn(apis.unsplash);

    return city => {
      fetchWeather(city)
        .then(fetchImages)
        .then(onImageData)
        .catch(onError);
    };
  };

  // Data fetching: Step 1 - weather
  const getFetchWeatherFn = ({ key, url }) => query => {
    return fetch(`${url}?q=${query}&appid=${key}`)
      .then(res => res.json(), onError)
      .catch(onError);
  };

  // Data fetching: Step 2 - fetch weather-related images & return aggregated data
  const getFetchImageFn = ({ key, url }) => weatherData => {
    const query = getWeatherConditions(weatherData);

    return fetch(`${url}?query=${query}&client_id=${key}`)
      .then(res => res.json(), onError)
      .then(imageData => ({ weatherData, imageData }))
      .catch(onError);
  };

  // Data fetching: Step 3 - All data loaded: build the UI
  function onImageData({ weatherData, imageData }) {
    const { results } = imageData;
    const conditions = getWeatherConditions(weatherData);

    const onThumbClick = getThumbClickFn(results, conditions, updateUI);
    const thumbLinks = createThumbLinks($thumbs, results);

    // Event delegation means flexible event management: no need to unbind event
    // handlers when we clear old thumbnails
    $thumbs.addEventListener("click", function(event) {
      if (event.target.matches("a")) {
        event.preventDefault();

        onThumbClick(thumbLinks.indexOf(event.target));
      }
    });

    onThumbClick(0);
  }

  const fetchData = getFetchFn(apis);

  function onSearch(event) {
    event.preventDefault();
    fetchData(this.city.value);
  }

  $searchForm.addEventListener("submit", onSearch);

  // START! Load the initial data
  fetchData(apis.weather.query);
}

new App({
  weather: {
    key: "a70fde74ccea0ae4b9d62142c9dece40",
    url: "http://api.openweathermap.org/data/2.5/weather",
    query: "London, uk"
  },
  unsplash: {
    key: "df24b455387acb47127898da32793c0e9b3a43b75af80a857feb17cffe4af7f0",
    url: "https://api.unsplash.com/search/photos",
    utm: "?utm_source=weather&utm_medium=referral&utm_campaign=api-credit"
  }
});
