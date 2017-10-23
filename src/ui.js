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

export default UI;
