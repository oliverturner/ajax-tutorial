// Utility methods
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

  const anchor = document.createElement("a");
  anchor.href = item.links.html;
  anchor.className = "thumbs__link";
  anchor.appendChild(img);

  return anchor;
}

function createThumbs(el, imageData) {
  const fragment = document.createDocumentFragment();
  imageData.forEach(item => fragment.appendChild(createThumb(item)));

  el.appendChild(fragment);

  return Array.from(el.children);
}

// APPLICATION
function App(config) {
  const $body = document.querySelector("body");
  const $img = document.querySelector("#img");
  const $thumbs = document.querySelector("#thumbs");
  const $search = document.querySelector("#search");
  const $searchField = document.querySelector("#search-tf");
  const $conditions = document.querySelector("#conditions");
  const $creditUser = document.querySelector("#credit-user");
  const $creditPlatform = document.querySelector("#credit-platform");

  $searchField.value = config.city;

  function getDisplayFn(imageData) {
    return function(index) {
      const image = imageData[index];
      $img.src = image.urls.regular;
      $body.style.backgroundColor = image.color;
      $creditUser.href = image.user.links.html + config.apis.unsplash.utm;
      $creditUser.textContent = image.user.name;
    };
  }

  function onSearch(event) {
    event.preventDefault();

    // Only search when the term is valid
    if (this.city.value.length) {
      fetchData(this.city.value);
    }
  }

  // Step 1
  const fetchWeather = query => {
    const key = config.apis.weather.key;
    const url = config.apis.weather.url;

    return fetch(`${url}?q=${query}&appid=${key}`)
      .then(res => res.json(), onError)
      .catch(onError);
  };

  // Step 2
  const fetchImages = weatherData => {
    const key = config.apis.unsplash.key;
    const url = config.apis.unsplash.url;
    const query = getWeatherQuery(weatherData);

    return fetch(`${url}?query=${query}&client_id=${key}`)
      .then(res => res.json(), onError)
      .then(imageData => ({ weatherData, imageData }))
      .catch(onError);
  };

  // Step 3
  const onImageData = ({ weatherData, imageData }) => {
    const { results } = imageData;
    const displayImage = getDisplayFn(results);
    const anchors = createThumbs($thumbs, results);

    $thumbs.addEventListener("click", function(event) {
      if (event.target.matches("a")) {
        event.preventDefault();
        displayImage(anchors.indexOf(event.target));
      }
    });

    $search.addEventListener("submit", onSearch);

    $conditions.textContent = getWeatherQuery(weatherData);

    displayImage(0);
  };

  const clearUI = () => {
    $img.removeAttribute("src");
    while ($thumbs.firstChild) {
      $thumbs.removeChild($thumbs.firstChild);
    }
  };

  const fetchData = city => {
    clearUI();
    fetchWeather(city)
      .then(fetchImages)
      .then(onImageData)
      .catch(onError);
  };

  $creditPlatform.href = `https://unsplash.com${config.apis.unsplash.utm}`;

  // START!
  fetchData(config.city);
}
