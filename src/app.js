import API from "./data/api";
import UI from "./ui";
import { getConfig } from "./utils";

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

export default App;
