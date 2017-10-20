// Check that the server has returned a 200 status
// (Unlike $.ajax, fetch doesn't treat error messages from the server as failed responses)
const checkRes = response => {
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response;
};

class API {
  constructor(config, onLoadCallback) {
    this.config = config;
    this.onLoadCallback = onLoadCallback;
    this.fetchCityWeatherImages = this.fetchCityWeatherImages.bind(this);
  }

  // Step 2/4: Load weather data for the given city
  fetchCityWeather(query) {
    const { key, url } = this.config.weather;
    const endpoint = `${url}?q=${query}&appid=${key}`;

    return fetch(endpoint)
      .then(checkRes)
      .then(res => res.json());
  }

  // Step 3/4: Load derived data (images that match the weather description)
  fetchCityWeatherImages(json) {
    const { key, url } = this.config.unsplash;
    const term = json.weather[0].description;
    const endpoint = `${url}?query=${term}&client_id=${key}`;

    return fetch(endpoint)
      .then(checkRes)
      .then(res => res.json())
      .then(data => ({ term, images: data.results }));
  }

  // Step 1/4: Initialise data loading
  load(query) {
    this.fetchCityWeather(query)
      .then(this.fetchCityWeatherImages)
      .then(this.onLoadCallback)
      .catch(err => {
        console.log("getCityWeather:", err);
      });
  }
}

export default API;
