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

function createThumbs(json) {
  const fragment = document.createDocumentFragment();
  json.map(function(item) {
    $thumbs.appendChild(createThumb(item));
  });

  return fragment;
}

// APPLICATION
(function() {
  let imageData = [];

  // Step 1
  const fetchWeather = () => {
    const key = apis.weather.key;
    const url = apis.weather.url;
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
    const url = apis.unsplash.url;
    const query = json.weather[0].main;

    $conditions.textContent = query;

    fetch(url + "?query=" + query + "&client_id=" + key)
      .then(res => res.json(), onError)
      .then(onImageData)
      .catch(onError);
  }

  // Step 3
  function onImageData(json) {
    imageData = json;
    $thumbs.appendChild(createThumbs(imageData));
    displayImage(0);
  }

  // Step 4
  function displayImage(index) {
    const image = imageData[index];
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
      displayImage(index);
    }
  }

  // START!
  $thumbs.addEventListener("click", onThumbClick);
  $creditPlatform.href = "https://unsplash.com" + apis.unsplash.utm;
  fetchWeather();
})();
