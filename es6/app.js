const getConfig = ({ weather, unsplash }) => {
  console.assert(weather.apiKey, "must supply weather.apiKey");
  console.assert(weather.city, "must supply weather.city");
  console.assert(unsplash.apiKey, "must supply unsplash.apiKey");
  console.assert(unsplash.appName, "must supply unsplash.appName");

  return {
    weather: {
      key: weather.apiKey,
      defaultQuery: weather.city,
      url: "http://api.openweathermap.org/data/2.5/weather"
    },
    unsplash: {
      key: unsplash.apiKey,
      utm: `utm_source=${unsplash.appName}&utm_medium=referral&utm_campaign=api-credit`,
      url: "https://api.unsplash.com/search/photos"
    }
  };
};

const clearChildren = parent => {
  Array.from(parent.children).forEach(el => parent.removeChild(el));
};

const onError = err => console.log(err);

const app = userConfig => {
  const $body = document.querySelector("body");
  const $search = document.querySelector("#search");
  const $thumbs = document.querySelector("#thumbs");
  const $photo = document.querySelector("#photo");
  const $creditUser = document.querySelector("#credit-user");
  const $creditPlatform = document.querySelector("#credit-platform");

  const config = getConfig(userConfig);

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
    // and add click event handlers directly
    images.forEach((image, index) => {
      const url = image.urls.html;
      const link = document.createElement("a");
      link.href = `${url}?${config.unsplash.utm}`;
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
    const { utm } = config.unsplash;
    const { user, urls, color } = image;

    $body.style["backgroundColor"] = color;
    $creditUser.href = `${user.links.html}?${utm}`;
    $creditUser.innerText = `"${term}" by ${user.name}`;

    updatePhoto(urls.full);
  };

  // Step 1/4: Initialise data loading
  const getCityWeather = query => {
    fetchCityWeather(query)
      .then(fetchCityWeatherImages)
      .then(displayCityWeatherImages);
  };

  // Step 2/4: Load weather data for the given city
  const fetchCityWeather = query => {
    const { key, url } = config.weather;
    const endpoint = `${url}?q=${query}&appid=${key}`;

    return fetch(endpoint).then(res => res.json(), onError);
  };

  // Step 3/4: Load derived data (images that match the weather description)
  const fetchCityWeatherImages = json => {
    const { key, url } = config.unsplash;
    const term = json.weather[0].description;
    const endpoint = `${url}?query=${term}&client_id=${key}`;

    return fetch(endpoint)
      .then(res => res.json(), onError)
      .then(data => ({ term, images: data.results }));
  };

  // Step 4/4: All data loaded... update the UI
  const displayCityWeatherImages = ({ term, images }) => {
    displayThumbs(term, images);
    displayMain(term, images[0]);
  };

  const onSearch = e => {
    e.preventDefault();
    getCityWeather($search.term.value);
  };

  $search.addEventListener("submit", onSearch);
  $search.term.value = config.weather.defaultQuery;

  $creditPlatform.href = `https://unsplash.com/?${config.unsplash.utm}`;

  return { getCityWeather };
};
