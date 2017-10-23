import { clearChildren } from "../utils";

class Thumbs {
  constructor($el, utm, displayMain) {
    this.$el = $el;
    this.utm = utm;

    this.links = [];
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

  onLinkClick(event) {
    event.preventDefault();

    const index = this.links.indexOf(event.currentTarget);
    this.setActiveIndex(index)
    this.displayMain(index);
  }

  setActiveIndex(index) {
    this.links.forEach(link => {
      link.classList.remove("active");
    });

    this.links[index].classList.add("active");
  }

  display(term, images) {
    clearChildren(this.$el);

    // We could use createDocumentFragment and event Delegation for perf
    // improvements... but for simplicity we append children directly to this.$els.thumbs
    // and add click event handlers directly
    this.links = images.map((image) => {
      const url = image.links.html;
      const alt = image.description || term;
      const thumbUrl = image.urls.thumb;

      const anchor = document.createElement("a");
      anchor.href = `${url}?${this.utm}`;
      anchor.className = "thumbs__link";
      anchor.addEventListener("click", this.onLinkClick);

      this.createThumb(anchor, thumbUrl, alt);

      return this.$el.appendChild(anchor);
    });
  }
}

export default Thumbs;
