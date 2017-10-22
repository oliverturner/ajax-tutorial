var CityWeather = (function () {
'use strict';

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

class Search {
  constructor(id, city, loadWeatherImages) {
    this.$el = document.querySelector(id);
    this.$tf = this.$el.querySelector("input");

    this.$el.city.value = city;
    this.$tf.addEventListener("focus", () => (this.$tf.value = ""));
    this.$el.addEventListener("submit", this.onSubmit(loadWeatherImages));
  }

  onSubmit(loadWeatherImages) {
    return (e) => {
      e.preventDefault();
  
      // Only search when the term is valid
      const city = this.$el.city.value;
      if (city.length) {
        loadWeatherImages(city);
      }
    }
  }
}

const clearChildren = (parent) => {
  Array.from(parent.children).forEach(el => parent.removeChild(el));
};

const getConfig = ({ weather, unsplash }) => {
  return {
    weather: {
      key: weather.apiKey,
      city: weather.city,
      url: "https://api.openweathermap.org/data/2.5/weather"
    },
    unsplash: {
      key: unsplash.apiKey,
      utm: `utm_source=${unsplash.appName}&utm_medium=referral&utm_campaign=api-credit`,
      url: "https://api.unsplash.com/search/photos"
    }
  };
};

class Photo {
  constructor(id) {
    this.$el = document.querySelector(id);

    this.display = this.display.bind(this);
  }

  // Clear the main image and load the supplied url
  // Only mount the image once the file has loaded to let it fade in nicely
  display(url, alt) {
    clearChildren(this.$el);

    const img = document.createElement("img");
    img.addEventListener("load", () => {
      // Take care of any async overruns (ghetto but effective!)
      clearChildren(this.$el);
      this.$el.appendChild(img);
    });
    img.src = url;
    img.alt = alt;
  }
}

class Thumbs {
  constructor(id, utm, displayMain) {
    this.$el = document.querySelector(id);
    this.utm = utm;

    this.links = [];
    this.displayMain = displayMain;
    this.onLinkClick = this.onLinkClick.bind(this);
  }

  createThumb(parent, src, alt) {
    const img = document.createElement("img");

    img.src = src;
    img.alt = alt;
    img.className = "thumbs__thumb";
    img.addEventListener("load", () => parent.appendChild(img));
  }

  onLinkClick(e) {
    e.preventDefault();

    const index = this.links.indexOf(event.currentTarget);
    this.setActiveIndex(index);
    this.displayMain(index);
  }

  setActiveIndex(index) {
    this.links.forEach(link => {
      link.classList.remove("active");
    });

    this.links[index].classList.add("active");
  }

  display(term, images) {
    clearChildren(this.$el);

    // We could use createDocumentFragment and event Delegation for perf
    // improvements... but for simplicity we append children directly to this.$els.thumbs
    // and add click event handlers directly
    this.links = images.map((image) => {
      const url = image.links.html;
      const alt = image.description || term;
      const thumbUrl = image.urls.thumb;

      const anchor = document.createElement("a");
      anchor.href = `${url}?${this.utm}`;
      anchor.className = "thumbs__link";
      anchor.addEventListener("click", this.onLinkClick);

      this.createThumb(anchor, thumbUrl, alt);

      return this.$el.appendChild(anchor);
    });
  }
}

class App {
  constructor(userConfig) {
    // Merge user-supplied values (api keys, etc.) into config
    this.config = getConfig(userConfig);

    const { city } = this.config.weather;
    const { utm } = this.config.unsplash;

    // Cache references to DOM elements
    this.$els = {
      body: document.querySelector("body"),
      creditUser: document.querySelector("#credit-user"),
      creditPlatform: document.querySelector("#credit-platform")
    };

    // Bind callbacks as ncessary
    this.loadWeatherImages = this.loadWeatherImages.bind(this);
    this.onWeatherImagesLoaded = this.onWeatherImagesLoaded.bind(this);
    this.onThumbClick = this.onThumbClick.bind(this);

    this.api = new API(this.config, this.onWeatherImagesLoaded);
    this.photo = new Photo("#photo");
    this.thumbs = new Thumbs("#thumbs", utm, this.onThumbClick);
    this.search = new Search("#search", city, this.loadWeatherImages);
    this.initPlatformCredits(utm);

    // Autoload default city images
    this.loadWeatherImages(city);
  }

  loadWeatherImages(city) {
    this.api.load(city);
  }

  onWeatherImagesLoaded({ term, images }) {
    this.images = images;
    this.currentTerm = term;
    this.thumbs.display(this.currentTerm, images);
    this.onThumbClick(0);
  }

  onThumbClick(index) {
    const image = this.images[index];
    const { user, urls, color, description } = image;

    this.thumbs.setActiveIndex(index);
    this.photo.display(urls.regular, description || this.currentTerm);
    this.updateUserCredit(this.currentTerm, user);
    this.$els.body.style["backgroundColor"] = color;
  }

  // INITIALISE
  initPlatformCredits(utm) {
    this.$els.creditPlatform.href = `https://unsplash.com/?${utm}`;
  }

  updateUserCredit(term, user) {
    this.$els.creditUser.href = `${user.links.html}?${this.utm}`;
    this.$els.creditUser.innerText = `"${term}" by ${user.name}`;
  }
}

return App;

}());
//# sourceMappingURL=app.js.map
