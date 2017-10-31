class App {
  constructor(userConfig) {
    // Merge user-supplied values (api keys, etc.) into config
    this.config = getConfig(userConfig);

    const city = this.config.weather.city;

    // Cache references to DOM elements
    this.$els = {
      body: document.querySelector("body"),
      creditUser: document.querySelector("#credit-user"),
      creditPlatform: document.querySelector("#credit-platform")
    };

    // Bind callbacks as ncessary
    this.loadWeatherImages = this.loadWeatherImages.bind(this);
    this.displayWeatherImages = this.displayWeatherImages.bind(this);
    this.onThumbClick = this.onThumbClick.bind(this);

    this.api = new API(this.config, this.displayWeatherImages);
    this.search = new Search("#search", city, this.loadWeatherImages);
    this.photo = new Photo("#photo");
    this.thumbs = new Thumbs(
      "#thumbs",
      this.config.unsplash.utm,
      this.onThumbClick
    );

    // Autoload default query images
    this.initPlatformCredits(this.config.unsplash.utm);
    this.loadWeatherImages(city);
  }

  loadWeatherImages(city) {
    this.api.load(city);
  }

  displayWeatherImages({ term, images }) {
    const image = images[0];
    const { user, urls, color, description } = image;

    this.currentTerm = term;
    this.thumbs.display(this.currentTerm, images);
    this.onThumbClick(image);
  }

  onThumbClick(image) {
    const { user, urls, color, description } = image;

    this.photo.display(this.currentTerm, urls.regular, description);
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
