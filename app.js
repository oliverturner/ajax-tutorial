function App(apis) {
  // Cache references to DOM elements
  const $body = document.querySelector("body");
  const $img = document.querySelector("#img");
  const $gallery = document.querySelector("#gallery");
  const $conditions = document.querySelector("#conditions");
  const $creditUser = document.querySelector("#credit-user");
  const $creditPlatform = document.querySelector("#credit-platform");

  $creditPlatform.href = `https://unsplash.com${apis.unsplash.utm}`;

  // Utility methods
  function onError(err) {
    console.log(err);
  }

  function parseWeather(weatherData) {
    return weatherData.weather[0].main;
  }

  function parseItem(item = {}) {
    return {
      thumbUrl: item.urls ? item.urls.thumb : "",
      imageUrl: item.links ? item.links.html : ""
    };
  }

  function getDisplayFn(imageData) {
    return function(index) {
      const image = imageData[index];
      $img.src = image.urls.regular;
      $body.style.backgroundColor = image.color;
      $creditUser.href = image.user.links.html + apis.unsplash.utm;
      $creditUser.textContent = image.user.name;
    };
  }

  function createThumbImage(thumbUrl) {
    const img = document.createElement("img");
    img.src = thumbUrl;
    img.className = "thumb__img";

    return img;
  }

  function createThumbLink(imageUrl, index) {
    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.className = "thumb";
    anchor.dataset.index = index;

    return anchor;
  }

  function createThumb(el, item, index) {
    const { thumbUrl, imageUrl } = parseItem(item);
    const img = createThumbImage(thumbUrl);
    const anchor = createThumbLink(imageUrl, index);

    anchor.appendChild(img);
    el.appendChild(anchor);

    return el;
  }

  function createThumbs(results) {
    const thumbs = document.createElement("div");
    thumbs.id = "thumbs";
    thumbs.className = "thumbs";

    return results.reduce(createThumb, thumbs);
  }

  function createGallery(results) {
    const displayImage = getDisplayFn(results);

    const thumbs = createThumbs(results);
    thumbs.addEventListener("click", function(event) {
      if (event.target.matches("a")) {
        event.preventDefault();
        displayImage(event.target.dataset.index);
      }
    });

    $gallery.innerHTML = "";
    $gallery.appendChild(thumbs);

    displayImage(0);
  }

  // Step 1
  const fetchWeather = query => {
    const key = apis.weather.key;
    const url = apis.weather.url;

    return fetch(`${url}?q=${query}&appid=${key}`)
      .then(res => res.json(), onError)
      .catch(onError);
  };

  // Step 2
  function fetchImages(weatherData) {
    const key = apis.unsplash.key;
    const url = apis.unsplash.url;
    const query = parseWeather(weatherData);

    return fetch(`${url}?query=${query}&client_id=${key}`)
      .then(res => res.json(), onError)
      .then(imageData => ({ weatherData, imageData }))
      .catch(onError);
  }

  // Step 3
  function updateUI({ weatherData, imageData }) {
    const { results } = imageData;

    $conditions.textContent = parseWeather(weatherData);
    createGallery(results);
  }

  // Step 0: orchestrate the data loading
  function fetchLocationData(location) {
    fetchWeather(location)
      .then(fetchImages)
      .then(updateUI)
      .catch(onError);
  }

  // Returning an object of local methods exposes them for unit testing
  return {
    parseWeather,
    parseItem,
    updateUI,
    fetchLocationData,
    fetchWeather,
    fetchImages,
    updateUI,
    getDisplayFn
  };
}

// Basic UMD
(function(root, factory) {
  root.App = factory();
})(this, function() {
  return App;
});
