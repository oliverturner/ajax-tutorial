class Search {
  constructor($el, city, loadWeatherImages) {
    this.$el = $el;
    this.$tf = this.$el.querySelector("input");

    this.$el.city.value = city;
    this.$tf.addEventListener("focus", () =>
      this.$tf.setSelectionRange(0, 9999)
    );
    this.$el.addEventListener("submit", this.onSubmit(loadWeatherImages));
  }

  onSubmit(loadWeatherImages) {
    return e => {
      e.preventDefault();

      // Only search when the term is valid
      const city = this.$el.city.value;
      if (city.length) {
        loadWeatherImages(city);
      }
    };
  }
}

export default Search;
