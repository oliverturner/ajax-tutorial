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
function App(apis) {
  const $body = document.querySelector("body");
  const $img = document.querySelector("#img");
  const $thumbs = document.querySelector("#thumbs");
  const $conditions = document.querySelector("#conditions");
  const $creditUser = document.querySelector("#credit-user");
  const $creditPlatform = document.querySelector("#credit-platform");

  function getDisplayFn(imageData) {
    return function(index) {
      const image = imageData[index];
      $img.src = image.urls.regular;
      $body.style.backgroundColor = image.color;
      $creditUser.href = image.user.links.html + apis.unsplash.utm;
      $creditUser.textContent = image.user.name;
    };
  }

  // Step 1
  const fetchWeather = () => {
    const key = apis.weather.key;
    const url = apis.weather.url;
    const query = "London,uk";

    return fetch(`${url}?q=${query}&appid=${key}`)
      .then(res => res.json(), onError)
      .catch(onError);
  };

  // Step 2
  function fetchImages(weatherData) {
    const key = apis.unsplash.key;
    const url = apis.unsplash.url;
    const query = getWeatherQuery(weatherData);

    return fetch(`${url}?query=${query}&client_id=${key}`)
      .then(res => res.json(), onError)
      .then(imageData => ({ weatherData, imageData }))
      .catch(onError);
  }

  // Step 3
  function onImageData({ weatherData, imageData }) {
    const displayImage = getDisplayFn(imageData);
    const anchors = createThumbs($thumbs, imageData);

    $thumbs.addEventListener("click", function(event) {
      if (event.target.matches("a")) {
        event.preventDefault();
        displayImage(anchors.indexOf(event.target));
      }
    });

    $conditions.textContent = getWeatherQuery(weatherData);

    displayImage(0);
  }

  const fetchData = () => {
    fetchWeather()
      .then(fetchImages)
      .then(onImageData)
      .catch(onError);
  };

  $creditPlatform.href = `https://unsplash.com${apis.unsplash.utm}`;

  // START!
  fetchData();
}
