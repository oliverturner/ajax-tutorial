const $body = document.querySelector("body");
const $searchform = document.querySelector("#searchform");
const $credit = document.querySelector("#credit");
const $thumbs = document.querySelector("#thumbs");
const $photo = document.querySelector("#photo");

const config = {
  weather: {
    key: "a70fde74ccea0ae4b9d62142c9dece40",
    url: "http://api.openweathermap.org/data/2.5/weather",
    defaultQuery: "London,uk"
  },
  unsplash: {
    key: "535abe4a18fd52841b910a3c853121ef902e958d92735c14e22828c6276eda85",
    url: "https://api.unsplash.com/search/photos",
    getUtm: campaign =>
      `utm_source=${campaign}&utm_medium=referral&utm_campaign=api-credit`
  }
};

const onError = err => {
  console.log(err);
};

const createThumb = src => {
  const img = document.createElement("img");
  img.src = src;
  img.className = "thumbs__thumb";

  return img;
};

createLink = url => {
  const link = document.createElement("a");
  link.href = `${url}?${config.unsplash.getUtm("weather")}`;

  return link;
};

const displayThumbs = images => {
  const fragment = document.createDocumentFragment();
  images.forEach(image => {
    const link = createLink(image.urls.html);
    link.appendChild(createThumb(image.urls.thumb));

    fragment.appendChild(link);
  });

  $thumbs.appendChild(fragment);
};

const updatePhoto = (url) => {
  Array.from($photo.children).forEach(el => $photo.removeChild(el));

  const img = document.createElement("img");
  img.addEventListener("load", () => {
    $photo.appendChild(img);
  });
  img.src = url;
};

const displayMain = (term, image) => {
  const { getUtm } = config.unsplash;
  const { user, urls, color } = image;

  $body.style["backgroundColor"] = color;
  $credit.href = `${user.links.html}?${getUtm("weather")}`;
  $credit.innerText = `"${term}" by ${user.name}`;

  updatePhoto(urls.full);
};

const onThumbClick = (term, images) => {
  const thumbs = Array.from($thumbs.children);

  return e => {
    e.preventDefault();

    const index = thumbs.indexOf(e.target);
    displayMain(term, images[index]);
  };
};

// Load data
//------------------------------------------------------------------------------
const fetchWeather = (query) => {
  const { key, url, defaultQuery } = config.weather;
  const location = query || defaultQuery
  const endpoint = `${url}?q=${query}&appid=${key}`;
  return fetch(endpoint).then(res => res.json(), onError);
};

const fetchImages = json => {
  const { key, url } = config.unsplash;
  const term = json.weather[0].main;
  const endpoint = `${url}?query=${term}&client_id=${key}`;

  return fetch(endpoint)
    .then(res => res.json(), onError)
    .then(data => ({ term, data }));
};

// Data loaded...
//------------------------------------------------------------------------------
const displayImages = ({term, data}) => {
  const images = data.results
  console.log("displayImages", images);

  displayThumbs(images);
  displayMain(term, images[0]);
  $thumbs.addEventListener("click", onThumbClick(term, images));
};

// Initialise
//------------------------------------------------------------------------------
const init = (query) => {
  fetchWeather(query)
    .then(fetchImages)
    .then(displayImages);
};

(function(scope) {
  init("Moscow");
})(this);
