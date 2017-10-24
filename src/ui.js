import Search from "./components/search";
import Photo from "./components/photo";
import Thumbs from "./components/thumbs";

import swipe from "./utils/swipe";

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

export default UI;
