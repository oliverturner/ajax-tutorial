import API from "./data/api";
import Search from "./components/search";
import Photo from "./components/photo";
import Thumbs from "./components/thumbs";
import { getConfig } from "./utils";

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

export default App;
