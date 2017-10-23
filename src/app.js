import API from "./data/api";
import Search from "./components/search";
import Photo from "./components/photo";
import Thumbs from "./components/thumbs";
import { getConfig } from "./utils";
import swipe from "./utils/swipe";

class App {
  constructor(userConfig) {
    // Merge user-supplied values (api keys, etc.) into config
    this.config = getConfig(userConfig);

    const { city } = this.config.weather;
    const { utm } = this.config.unsplash;

    // Cache references to DOM elements
    this.$els = {
      body: document.querySelector("body"),
      photo: document.querySelector("#photo"),
      thumbs: document.querySelector("#thumbs"),
      search: document.querySelector("#search"),
      creditUser: document.querySelector("#credit-user"),
      creditPlatform: document.querySelector("#credit-platform")
    };

    // Bind callbacks as ncessary
    this.loadWeatherImages = this.loadWeatherImages.bind(this);
    this.onWeatherImagesLoaded = this.onWeatherImagesLoaded.bind(this);
    this.setActiveIndex = this.setActiveIndex.bind(this);

    // Bootstrap UI components
    this.api = new API(this.config, this.onWeatherImagesLoaded);
    this.photo = new Photo(this.$els.photo);
    this.thumbs = new Thumbs(this.$els.thumbs, utm, this.setActiveIndex);
    this.search = new Search(this.$els.search, city, this.loadWeatherImages);
    this.initPlatformCredits(utm);

    // Bind keyboard events
    document.onkeydown = this.onKeyDown.bind(this);
    this.keyBindings = {
      ArrowRight: this.moveToIndex("next"),
      ArrowLeft: this.moveToIndex("prev")
    };

    // Handle swipe gestures
    swipe(this.$els.photo, {
      swipeLeft: this.moveToIndex("prev"),
      swipeRight: this.moveToIndex("next")
    });

    // Autoload default city images
    this.loadWeatherImages(city);
  }
  
  loadWeatherImages(city) {
    this.activeIndex = 0;
    this.api.load(city);
  }

  onWeatherImagesLoaded({ term, images }) {
    this.images = images;
    this.currentTerm = term;
    this.thumbs.display(this.currentTerm, images);
    this.setActiveIndex(0);
  }

  onKeyDown(e) {
    const fn = this.keyBindings[e.code];
    if (fn) fn();
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
    const { user, urls, color, description } = image;

    this.thumbs.setActiveIndex(this.activeIndex);
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

export default App;
