// Check that the server has returned a 200 status
// (Unlike $.ajax, fetch doesn't treat error messages from the server as failed responses)
const checkRes = response => {
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response;
};

class API {
  constructor(config) {
    this.config = config;
    this.fetchImages = this.fetchImages.bind(this);
  }

  // Step 1/3: Load weather data for the given city
  fetchCityWeather(query) {
    const { apiKey, url } = this.config.weather;
    const endpoint = `${url}?q=${query}&appid=${apiKey}`;

    return fetch(endpoint)
      .then(checkRes)
      .then(res => res.json());
  }

  // Step 2/3: Load derived data
  // i.e. images that match the city's weather description
  fetchImages(json) {
    console.log(json);

    const { url, apiKey } = this.config.unsplash;
    const { perPage } = this.config.ui;
    const term = json.weather[0].description;
    const endpoint = `${url}?query=${term}&client_id=${apiKey}&per_page=${perPage}`;

    return fetch(endpoint)
      .then(checkRes)
      .then(res => res.json())
      .then(data => ({ term, data }));
  }

  // Step 3/3 once data resolved execute the supplied callback
  load(query, onLoaded) {
    this.fetchCityWeather(query)
      .then(this.fetchImages)
      .then(onLoaded)
      .catch(err => {
        console.log("getCityWeather:", err);
      });
  }
}

export default API;
