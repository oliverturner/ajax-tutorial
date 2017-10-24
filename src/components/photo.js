import { clearChildren } from "../utils";

class Photo {
  constructor($el) {
    this.$el = $el;

    this.display = this.display.bind(this);
  }

  clear() {
    clearChildren(this.$el);
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

export default Photo;