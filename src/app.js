import API from "./data/api";
import UI from "./ui";
import { mergeConfigs, onError } from "./utils";

const defaultConfig = {
  weather: {
    apiKey: "",
    city: "",
    url: "https://api.openweathermap.org/data/2.5/weather"
  },
  unsplash: {
    apiKey: "",
    utm: `utm_source=&utm_medium=referral&utm_campaign=api-credit`,
    url: "https://api.unsplash.com/search/photos"
  },
  ui: {
    perPage: 10
  }
};

class App {
  constructor(userConfig) {
    // Merge user-supplied values (api keys, etc.) into config
    this.config = mergeConfigs(defaultConfig, userConfig);
    const { city } = this.config.weather;
    const { utm } = this.config.unsplash;

    // Bind callbacks as necessary
    this.loadWeatherImages = this.loadData.bind(this);
    this.onWeatherImagesLoaded = this.onWeatherImagesLoaded.bind(this);
    this.setActiveIndex = this.setActiveIndex.bind(this);
    this.moveToIndex = this.moveToIndex.bind(this);

    // Bootstrap UI components
    this.ui = new UI(utm, city, {
      loadData: this.loadData,
      moveToIndex: this.moveToIndex,
      setActiveIndex: this.setActiveIndex
    });
    this.api = new API(this.config);

    // Autoload default city images
    this.loadData(city);
  }

  loadData(city) {
    this.activeIndex = 0;
    this.ui.reset();
    this.api
      .load(city)
      .then(this.onWeatherImagesLoaded)
      .catch(onError);
  }

  onWeatherImagesLoaded({ term, data }) {
    console.log(data);

    this.images = data.results;
    this.ui.displayThumbs(term, this.images);
    this.setActiveIndex(0);
  }

  moveToIndex(dir) {
    const { perPage } = this.config.ui;
    let n;

    return () => {
      n = dir === "next" ? this.activeIndex + 1 : this.activeIndex - 1;
      n = n >= 0 ? n : n + perPage;
      this.setActiveIndex(n % perPage);
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
