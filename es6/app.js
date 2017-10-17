const defaultConfig = {
  weather: {
    key: "a70fde74ccea0ae4b9d62142c9dece40",
    url: "http://api.openweathermap.org/data/2.5/weather",
    defaultQuery: "London"
  },
  unsplash: {
    key: "535abe4a18fd52841b910a3c853121ef902e958d92735c14e22828c6276eda85",
    url: "https://api.unsplash.com/search/photos",
    getUtm: campaign =>
      `utm_source=${campaign}&utm_medium=referral&utm_campaign=api-credit`
  }
};

const clearChildren = parent => {
  Array.from(parent.children).forEach(el => parent.removeChild(el));
};

const onError = err => console.log(err);

const app = config => {
  const $body = document.querySelector("body");
  const $search = document.querySelector("#search");
  const $credit = document.querySelector("#credit");
  const $thumbs = document.querySelector("#thumbs");
  const $photo = document.querySelector("#photo");

  const createThumb = src => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "thumbs__thumb";

    return img;
  };

  const onLinkClick = (term, image) => e => {
    e.preventDefault();
    displayMain(term, image);
  };

  const displayThumbs = (term, images) => {
    clearChildren($thumbs);

    // We could use createDocumentFragment and event Delegation for perf
    // improvements... but for simplicity we append children directly to $thumbs
    // and listen directly to click events
    images.forEach((image, index) => {
      const url = image.urls.html;
      const link = document.createElement("a");
      link.href = `${url}?${config.unsplash.getUtm("weather")}`;
      link.appendChild(createThumb(image.urls.thumb));
      link.addEventListener("click", onLinkClick(term, images[index]));

      $thumbs.appendChild(link);
    });
  };

  // Clear the main image and load the supplied url
  // Only mount the image once the file has loaded to let it fade in nicely
  const updatePhoto = url => {
    clearChildren($photo);

    const img = document.createElement("img");
    img.addEventListener("load", () => $photo.appendChild(img));
    img.src = url;
  };

  // Update the main UI
  const displayMain = (term, image) => {
    const { getUtm } = config.unsplash;
    const { user, urls, color } = image;

    $body.style["backgroundColor"] = color;
    $credit.href = `${user.links.html}?${getUtm("weather")}`;
    $credit.innerText = `"${term}" by ${user.name}`;

    updatePhoto(urls.full);
  };

  // Load weather data for the given city
  const fetchCityWeather = query => {
    const { key, url } = config.weather;
    const endpoint = `${url}?q=${query}&appid=${key}`;
    return fetch(endpoint).then(res => res.json(), onError);
  };

  // Looad derived data (images that match the weather description)
  const fetchCityWeatherImages = json => {
    const { key, url } = config.unsplash;
    const term = json.weather[0].description;
    const endpoint = `${url}?query=${term}&client_id=${key}`;

    return fetch(endpoint)
      .then(res => res.json(), onError)
      .then(data => ({ term, data }));
  };

  // Data loaded... update the UI
  const displayCityWeatherImages = ({ term, data }) => {
    const images = data.results;

    displayThumbs(term, images);
    displayMain(term, images[0]);
  };

  // Initialise data loading
  const getCityWeather = query => {
    fetchCityWeather(query)
      .then(fetchCityWeatherImages)
      .then(displayCityWeatherImages);
  };

  const onSearch = e => {
    e.preventDefault();
    getCityWeather($search.term.value);
  };

  $search.addEventListener("submit", onSearch);
  $search.term.value = config.weather.defaultQuery;

  return getCityWeather;
};
