var Meteoropolis = (function () {
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
  constructor($el, city, loadWeatherImages) {
    this.$el = $el;
    this.$tf = this.$el.querySelector("input");

    this.$el.city.value = city;
    this.$tf.addEventListener("focus", () =>
      this.$tf.setSelectionRange(0, 9999)
    );
    this.$el.addEventListener("submit", this.onSubmit(loadWeatherImages));
  }

  onSubmit(loadWeatherImages) {
    return e => {
      e.preventDefault();

      // Only search when the term is valid
      const city = this.$el.city.value;
      if (city.length) {
        loadWeatherImages(city);
      }
    };
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
    },
    ui: {
      pageSize: 10
    }
  };
};

class Photo {
  constructor($el) {
    this.$el = $el;

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
  constructor($el, utm, displayMain) {
    this.$el = $el;
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

const onGesture = swipeHandlers => (
  touchstartX,
  touchstartY,
  touchendX,
  touchendY
) => {
  if (touchendX < touchstartX) {
    swipeHandlers["swipeLeft"] && swipeHandlers["swipeLeft"]();
  }
  if (touchendX > touchstartX) {
    swipeHandlers["swipeRight"] && swipeHandlers["swipeRight"]();
  }
  if (touchendY < touchstartY) {
    swipeHandlers["swipeDown"] && swipeHandlers["swipeDown"]();
  }
  if (touchendY > touchstartY) {
    swipeHandlers["swipeUp"] && swipeHandlers["swipeUp"]();
  }
  if (touchendY === touchstartY) {
    swipeHandlers["tap"] && swipeHandlers["tap"]();
  }
};

var swipe = ($el, swipeHandlers) => {
  const onTouchEnd = onGesture(swipeHandlers);

  let touchstartX;
  let touchstartY;
  let touchendX;
  let touchendY;

  $el.addEventListener(
    "touchstart",
    function(event) {
      touchstartX = event.changedTouches[0].screenX;
      touchstartY = event.changedTouches[0].screenY;
    },
    false
  );

  $el.addEventListener(
    "touchend",
    function(event) {
      touchendX = event.changedTouches[0].screenX;
      touchendY = event.changedTouches[0].screenY;
      onTouchEnd(touchstartX, touchstartY, touchendX, touchendY);
    },
    false
  );
};

class UI {
  constructor(utm, city, cbs) {
    // Cache references to DOM elements
    this.$els = {
      body: document.querySelector("body"),
      photo: document.querySelector("#photo"),
      thumbs: document.querySelector("#thumbs"),
      search: document.querySelector("#search"),
      creditUser: document.querySelector("#credit-user"),
      creditPlatform: document.querySelector("#credit-platform")
    };

    // Bootstrap UI components
    this.photo = new Photo(this.$els.photo);
    this.thumbs = new Thumbs(this.$els.thumbs, utm, cbs.setActiveIndex);
    this.search = new Search(this.$els.search, city, cbs.loadWeatherImages);
    this.initPlatformCredits(utm);

    // Bind keyboard events
    document.onkeydown = this.onKeyDown.bind(this);
    this.keyBindings = {
      ArrowRight: cbs.moveToIndex("next"),
      ArrowLeft: cbs.moveToIndex("prev")
    };

    // Handle swipe gestures
    swipe(this.$els.photo, {
      swipeLeft: cbs.moveToIndex("prev"),
      swipeRight: cbs.moveToIndex("next")
    });
  }

  displayThumbs(term, images) {
    this.currentTerm = term;
    this.thumbs.display(this.currentTerm, images);
  }

  displayMain(index, image) {
    const { user, urls, color, description } = image;

    this.thumbs.setActiveIndex(index);
    this.photo.display(urls.regular, description || this.currentTerm);
    this.updateUserCredit(this.currentTerm, user);
    this.$els.body.style["backgroundColor"] = color;
  }

  // INITIALISE
  onKeyDown(e) {
    const fn = this.keyBindings[e.code];
    if (fn) fn();
  }

  initPlatformCredits(utm) {
    this.$els.creditPlatform.href = `https://unsplash.com/?${utm}`;
  }

  updateUserCredit(term, user) {
    this.$els.creditUser.href = `${user.links.html}?${this.utm}`;
    this.$els.creditUser.innerText = `"${term}" by ${user.name}`;
  }
}

class App {
  constructor(userConfig) {
    // Merge user-supplied values (api keys, etc.) into config
    this.config = getConfig(userConfig);
    const { city } = this.config.weather;
    const { utm } = this.config.unsplash;

    // Bind callbacks as ncessary
    this.loadWeatherImages = this.loadWeatherImages.bind(this);
    this.onWeatherImagesLoaded = this.onWeatherImagesLoaded.bind(this);
    this.setActiveIndex = this.setActiveIndex.bind(this);
    this.moveToIndex = this.moveToIndex.bind(this);

    // Bootstrap UI components
    this.ui = new UI(utm, city, {
      setActiveIndex: this.setActiveIndex,
      loadWeatherImages: this.loadWeatherImages,
      moveToIndex: this.moveToIndex
    });
    this.api = new API(this.config, this.onWeatherImagesLoaded);

    // Autoload default city images
    this.loadWeatherImages(city);
  }

  loadWeatherImages(city) {
    this.activeIndex = 0;
    this.api.load(city);
  }

  onWeatherImagesLoaded({ term, images }) {
    this.images = images;
    this.ui.displayThumbs(term, images);
    this.setActiveIndex(0);
  }

  moveToIndex(dir) {
    const { pageSize } = this.config.ui;
    let n;

    return () => {
      n = dir === "next" ? this.activeIndex + 1 : this.activeIndex - 1;
      n = n >= 0 ? n : n + pageSize;
      this.setActiveIndex(n % pageSize);
    };
  }

  setActiveIndex(index) {
    this.activeIndex = index;

    const image = this.images[this.activeIndex];
    this.ui.displayMain(this.activeIndex, image);
  }
}

return App;

}());
//# sourceMappingURL=app.js.map
