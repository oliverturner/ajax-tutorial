class Thumbs {
  constructor(id, utm, displayMain) {
    this.$el = document.querySelector(id);
    this.utm = utm;

    this.displayMain = displayMain;
    this.onLinkClick = this.onLinkClick.bind(this);
  }

  createThumb(parent, src, alt) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.className = "thumbs__thumb";
    img.addEventListener("load", () => parent.appendChild(img));
  }

  onLinkClick(image) {
    return e => {
      e.preventDefault();
      this.displayMain(image);
    };
  }

  display(term, images) {
    clearChildren(this.$el);

    // We could use createDocumentFragment and event Delegation for perf
    // improvements... but for simplicity we append children directly to this.$els.thumbs
    // and add click event handlers directly
    images.forEach((image, index) => {
      const url = image.links.html;
      const alt = image.description || term;
      const thumbUrl = image.urls.thumb;

      const anchor = document.createElement("a");
      anchor.href = `${url}?${this.utm}`;
      anchor.className = "thumbs__link";
      anchor.addEventListener("click", this.onLinkClick(images[index]));

      this.createThumb(anchor, thumbUrl, alt);

      this.$el.appendChild(anchor);
    });
  }
}
