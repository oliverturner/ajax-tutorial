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
  constructor(config) {
    this.config = config;
    this.fetchCityWeatherImages = this.fetchCityWeatherImages.bind(this);
  }

  // Step 1/3: Load weather data for the given city
  fetchCityWeather(query) {
    const { key, url } = this.config.weather;
    const endpoint = `${url}?q=${query}&appid=${key}`;

    return fetch(endpoint)
      .then(checkRes)
      .then(res => res.json());
  }

  // Step 2/3: Load derived data (images that match the weather description)
  fetchCityWeatherImages(json) {
    const { key, url } = this.config.unsplash;
    const term = json.weather[0].description;
    const endpoint = `${url}?query=${term}&client_id=${key}`;

    return fetch(endpoint)
      .then(checkRes)
      .then(res => res.json())
      .then(data => ({ term, images: data.results }));
  }

  // Step 3/3 once data resolved execute the supplied callback
  load(query, onLoaded) {
    this.fetchCityWeather(query)
      .then(this.fetchCityWeatherImages)
      .then(onLoaded)
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
  constructor($el, utm, onClickCallback) {
    this.$el = $el;
    this.utm = utm;

    this.links = [];
    this.onClickCallback = onClickCallback;
    this.onLinkClick = this.onLinkClick.bind(this);

    this.$el.addEventListener("click", this.onLinkClick);
  }

  // Event delegation: more efficient than individually attaching event handlers
  onLinkClick(event) {
    if (event.target.matches("a")) {
      event.preventDefault();

      const index = this.links.indexOf(event.target);
      this.setActiveIndex(index);
      this.onClickCallback(index);
    }
  }

  setActiveIndex(index) {
    this.links.forEach((link, i) => {
      const fn = i === index ? "add" : "remove";
      link.classList[fn]("active");
    });
  }

  display(term, images) {
    clearChildren(this.$el);

    // Create an off-canvas fragment and append children, batching DOM insertion
    const f = document.createDocumentFragment();
    this.links = images.map(image => {
      const id = image.id;
      const url = image.links.html;
      const alt = image.description || term;
      const thumbUrl = image.urls.thumb;

      return f.appendChild(this.createThumb(id, url, thumbUrl, alt));
    });

    // Thumbs are added in a single hit
    this.$el.appendChild(f);
  }

  createThumb(id, href, src, alt) {
    const anchor = document.createElement("a");
    anchor.id = id;
    anchor.href = `${href}?${this.utm}`;
    anchor.className = "thumbs__link";

    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.className = "thumbs__link__img";

    // Defer inserting the img element until source loaded: allows fading in
    img.addEventListener("load", () => anchor.appendChild(img));

    return anchor;
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
    { passive: true }
  );

  $el.addEventListener(
    "touchend",
    function(event) {
      touchendX = event.changedTouches[0].screenX;
      touchendY = event.changedTouches[0].screenY;
      onTouchEnd(touchstartX, touchstartY, touchendX, touchendY);
    },
    { passive: true }
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
      conditions: document.querySelector("#conditions"),
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
    this.$els.conditions.textContent = term;
    this.thumbs.display(term, images);
  }

  displayMain(index, image) {
    const { user, urls, color, description } = image;

    this.thumbs.setActiveIndex(index);
    this.photo.display(urls.regular, description || this.currentTerm);
    this.updateUserCredit(user);
    this.$els.body.style["backgroundColor"] = color;
  }

  // INITIALISE
  onKeyDown(event) {
    const fn = this.keyBindings[event.code];
    if (fn) fn();
  }

  initPlatformCredits(utm) {
    this.$els.creditPlatform.href = `https://unsplash.com/?${utm}`;
  }

  updateUserCredit(user) {
    this.$els.creditUser.href = `${user.links.html}?${this.utm}`;
    this.$els.creditUser.innerText = user.name;
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
    this.api = new API(this.config);

    // Autoload default city images
    this.loadWeatherImages(city);
  }

  loadWeatherImages(city) {
    this.activeIndex = 0;
    this.api.load(city, this.onWeatherImagesLoaded);
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
    window.location.hash = image.id;
  }
}

return App;

}());
//# sourceMappingURL=app.js.map
