const getConfig = ({ weather, unsplash }) => {
  console.assert(weather.apiKey, "must supply weather.apiKey");
  console.assert(weather.city, "must supply weather.city");
  console.assert(unsplash.apiKey, "must supply unsplash.apiKey");
  console.assert(unsplash.appName, "must supply unsplash.appName");

  return {
    weather: {
      key: weather.apiKey,
      defaultQuery: weather.city,
      url: "https://api.openweathermap.org/data/2.5/weather"
    },
    unsplash: {
      key: unsplash.apiKey,
      utm: `utm_source=${unsplash.appName}&utm_medium=referral&utm_campaign=api-credit`,
      url: "https://api.unsplash.com/search/photos"
    }
  };
};

// Utility methods
//------------------------------------------------------------------------------
const clearChildren = parent => {
  Array.from(parent.children).forEach(el => parent.removeChild(el));
};

// Check that the server has returned a 200 status
// (Unlike $.ajax, fetch doesn't treat error messages from the server as failed responses)
const checkRes = response => {
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response;
};

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------
function App(userConfig) {
  // Cache references to DOM elements
  const $body = document.querySelector("body");
  const $thumbs = document.querySelector("#thumbs");
  const $photo = document.querySelector("#photo");
  const $search = document.querySelector("#search");
  const $searchField = document.querySelector("#search-tf");
  const $creditUser = document.querySelector("#credit-user");
  const $creditPlatform = document.querySelector("#credit-platform");

  // Merge user-supplied values (api keys, etc.) into config
  const config = getConfig(userConfig);

  const createThumb = (parent, src, alt) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.className = "thumbs__thumb";
    img.addEventListener("load", () => parent.appendChild(img));
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
      const url = image.links.html;
      const alt = image.description || term;
      const thumbUrl = image.urls.thumb;

      const anchor = document.createElement("a");
      anchor.href = `${url}?${config.unsplash.utm}`;
      anchor.className = "thumbs__link";
      anchor.addEventListener("click", onLinkClick(term, images[index]));

      createThumb(anchor, thumbUrl, alt);

      $thumbs.appendChild(anchor);
    });
  };

  // Clear the main image and load the supplied url
  // Only mount the image once the file has loaded to let it fade in nicely
  const updatePhoto = (url, alt) => {
    clearChildren($photo);

    const img = document.createElement("img");
    img.addEventListener("load", () => {
      // Take care of any async overruns (ghetto but effective!)
      clearChildren($photo);
      $photo.appendChild(img)
    });
    img.src = url;
    img.alt = alt;
  };

  // Update the main UI
  const displayMain = (term, image) => {
    const { utm } = config.unsplash;
    const { user, urls, color, description } = image;

    const alt = description || term;
    const imageUrl = urls.regular;

    $body.style["backgroundColor"] = color;
    $creditUser.href = `${user.links.html}?${utm}`;
    $creditUser.innerText = `"${term}" by ${user.name}`;

    updatePhoto(imageUrl, alt);
  };

  // LOADING
  //----------------------------------------------------------------------------
  // Step 1/4: Initialise data loading
  const getCityWeather = query => {
    fetchCityWeather(query)
      .then(fetchCityWeatherImages)
      .then(displayCityWeatherImages)
      .catch(err => {
        console.log("getCityWeather:", err);
      });
  };

  // Step 2/4: Load weather data for the given city
  const fetchCityWeather = query => {
    const { key, url } = config.weather;
    const endpoint = `${url}?q=${query}&appid=${key}`;

    return fetch(endpoint)
      .then(checkRes)
      .then(res => res.json());
  };

  // Step 3/4: Load derived data (images that match the weather description)
  const fetchCityWeatherImages = json => {
    const { key, url } = config.unsplash;
    const term = json.weather[0].description;
    const endpoint = `${url}?query=${term}&client_id=${key}`;

    return fetch(endpoint)
      .then(checkRes)
      .then(res => res.json())
      .then(data => ({ term, images: data.results }));
  };

  // Step 4/4: All data loaded...
  // Call the methods that build the UI
  const displayCityWeatherImages = ({ term, images }) => {
    displayThumbs(term, images);
    displayMain(term, images[0]);
  };

  const onSearch = e => {
    e.preventDefault();

    // Only search when the term is valid
    const term = $search.term.value;
    if (term.length) {
      getCityWeather(term);
    }
  };

  // INITIALISE
  //----------------------------------------------------------------------------
  const initCredits = utm => {
    $creditPlatform.href = `https://unsplash.com/?${utm}`;
  };
  const initSearch = () => {
    $search.addEventListener("submit", onSearch);
    $search.term.value = config.weather.defaultQuery;
    $searchField.addEventListener("focus", () => ($searchField.value = ""));
  };

  // Grab DOM references and add event handlers
  const initUI = () => {
    initCredits(config.unsplash.utm);
    initSearch();
  };

  // Bootstrap UI and autoload first image
  initUI();
  getCityWeather(config.weather.defaultQuery);
}
