class Search {
  constructor(id, city, loadWeatherImages) {
    this.$el = document.querySelector(id);
    this.$tf = this.$el.querySelector("input");

    this.$el.city.value = city;
    this.$tf.addEventListener("focus", () => (this.$tf.value = ""));
    this.$el.addEventListener("submit", this.onSubmit(loadWeatherImages));
  }

  onSubmit(loadWeatherImages) {
    return (e) => {
      e.preventDefault();
  
      // Only search when the term is valid
      const city = this.$el.city.value;
      if (city.length) {
        loadWeatherImages(city);
      }
    }
  }
}

export default Search;