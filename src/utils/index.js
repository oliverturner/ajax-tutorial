export const clearChildren = (parent) => {
  Array.from(parent.children).forEach(el => parent.removeChild(el));
}

export const getConfig = ({ weather, unsplash }) => {
  return {
    weather: {
      key: weather.apiKey,
      city: weather.city,
      url: "https://api.openweathermap.org/data/2.5/weather"
    },
    unsplash: {
      key: unsplash.apiKey,
      utm: `utm_source=${unsplash.appName}&utm_medium=referral&utm_campaign=api-credit`,
      url: "https://api.unsplash.com/search/photos"
    }
  };
};