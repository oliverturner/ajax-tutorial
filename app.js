const $body = document.querySelector("body");
const $img = document.querySelector("#img");
const $thumbs = document.querySelector("#thumbs");
const $conditions = document.querySelector("#conditions");
const $creditUser = document.querySelector("#credit-user");
const $creditPlatform = document.querySelector("#credit-platform");

const apis = {
  weather: {
    key: "a70fde74ccea0ae4b9d62142c9dece40",
    url: "http://api.openweathermap.org/data/2.5/weather"
  },
  unsplash: {
    key: "df24b455387acb47127898da32793c0e9b3a43b75af80a857feb17cffe4af7f0",
    url: "https://api.unsplash.com/photos/",
    utm: "?utm_source=weather&utm_medium=referral&utm_campaign=api-credit"
  }
};

// Utility methods
function onError(err) {
  console.log(err);
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

function createThumbs(imageData) {
  const fragment = document.createDocumentFragment();
  imageData.map(item => {
    $thumbs.appendChild(createThumb(item));
  });

  return fragment;
}

// APPLICATION
(() => {
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
    const query = weatherData.weather[0].main;

    $conditions.textContent = query;

    return fetch(`${url}?query=${query}&client_id=${key}`)
      .then(res => res.json(), onError)
      .then(imageData => ({weatherData, imageData}))
      .catch(onError);
  }

  // Step 3
  function onImageData({weatherData, imageData}) {
    function displayImage(image) {
      $img.src = image.urls.regular;
      $body.style.backgroundColor = image.color;
      $creditUser.href = image.user.links.html + apis.unsplash.utm;
      $creditUser.textContent = image.user.name;
    }
  
    // Event handlers
    function onThumbClick(event) {
      if (event.target.matches("a")) {
        event.preventDefault();
        const links = Array.from($thumbs.children);
        const index = links.indexOf(event.target);
        displayImage(imageData[index]);
      }
    }

    $thumbs.appendChild(createThumbs(imageData));
    $thumbs.addEventListener("click", onThumbClick);
    displayImage(0);
  }

  const fetchData = () => {
    fetchWeather()
      .then(fetchImages)
      .then(onImageData)
      .catch(onError)
  }

  $creditPlatform.href = `https://unsplash.com${apis.unsplash.utm}`;
  
  // START!
  fetchData()
})();
