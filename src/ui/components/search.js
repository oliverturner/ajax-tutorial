import { ignoreArrowClicks } from "../../utils";

class Search {
  constructor($el, initialCity, onSearch) {
    this.$el = $el;
    this.$tf = this.$el.querySelector("input");

    this.$el.city.value = initialCity;

    this.$el.addEventListener("submit", this.onSubmit.bind(this));
    this.$tf.addEventListener("keydown", ignoreArrowClicks);
    this.$tf.addEventListener("focus", () =>
      this.$tf.setSelectionRange(0, 9999)
    );

    this.onSearch = onSearch;
  }

  onSubmit(e) {
    e.preventDefault();

    // Only search when the term is valid
    const city = this.$el.city.value;
    if (city.length) {
      this.onSearch(city);
    }
  }
}

export default Search;
