import { clearChildren } from "../../utils";

class Thumbs {
  constructor($el, utm, onClickCallback) {
    this.$el = $el;
    this.utm = utm;

    this.links = [];
    this.onClickCallback = onClickCallback;
    this.onLinkClick = this.onLinkClick.bind(this);

    this.$el.addEventListener("click", this.onLinkClick);
  }

  // Event delegation: more efficient than individually attaching event handlers
  onLinkClick(event) {
    if (event.target.matches("a")) {
      event.preventDefault();

      const index = this.links.indexOf(event.target);
      this.setActiveIndex(index);
      this.onClickCallback(index);
    }
  }

  setActiveIndex(index) {
    this.links.forEach((link, i) => {
      const fn = i === index ? "add" : "remove";
      link.classList[fn]("active");
    });
  }

  clear() {
    clearChildren(this.$el);
  }

  display(term, images) {
    clearChildren(this.$el);

    // Create an off-canvas fragment and append children, batching DOM insertion
    const f = document.createDocumentFragment();
    this.links = images.map(image => {
      const id = image.id;
      const url = image.links.html;
      const alt = image.description || term;
      const thumbUrl = image.urls.thumb;

      return f.appendChild(this.createThumb(id, url, thumbUrl, alt));
    });

    // Thumbs are added in a single hit
    this.$el.appendChild(f);
  }

  createThumb(id, href, src, alt) {
    const anchor = document.createElement("a");
    anchor.id = id;
    anchor.href = `${href}?${this.utm}`;
    anchor.className = "thumbs__link";

    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.className = "thumbs__link__img";

    // Defer inserting the img element until source loaded: allows fading in
    img.addEventListener("load", () => anchor.appendChild(img));

    return anchor;
  }
}

export default Thumbs;
