class Search {
  constructor(id, city, loadWeatherImages) {
    this.$el = document.querySelector(id);
    this.$tf = this.$el.querySelector("input");

    this.$el.term.value = city;
    this.$tf.addEventListener("focus", () => (this.$tf.value = ""));
    this.$el.addEventListener("submit", this.onSubmit(loadWeatherImages));
  }

  onSubmit(loadWeatherImages) {
    return (e) => {
      e.preventDefault();
  
      // Only search when the term is valid
      const term = this.$el.term.value;
      if (term.length) {
        loadWeatherImages(term);
      }
    }
  }
}

export default Search;