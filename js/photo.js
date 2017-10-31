class Photo {
  constructor(id) {
    this.$el = document.querySelector(id);

    this.display = this.display.bind(this);
  }

  // Clear the main image and load the supplied url
  // Only mount the image once the file has loaded to let it fade in nicely
  update(url, alt) {
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

  // Update the main UI
  display(term, imageUrl, description) {
    console.log("imageUrl", imageUrl)

    this.update(imageUrl, description || term);
  }
}
