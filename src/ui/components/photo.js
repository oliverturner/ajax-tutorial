import { clearChildren } from "../../utils";

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
  display(width, height, thumbURL, mainURL, alt) {
    clearChildren(this.$el);

    const placeholder = document.createElement("img");
    placeholder.src = thumbURL;
    placeholder.alt = alt;
    placeholder.width = width;
    placeholder.height = height;
    placeholder.className = "photo__placeholder";
    this.$el.appendChild(placeholder);

    const img = document.createElement("img");
    img.addEventListener("load", () => {
      // Take care of any async overruns (ghetto but effective!)
      clearChildren(this.$el);
      this.$el.appendChild(img);
    });
    img.src = mainURL;
    img.alt = alt;
    img.className = "photo__main";
  }
}

export default Photo;
