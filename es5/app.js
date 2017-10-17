const $body = document.querySelector("body")
const $btn = document.querySelector("#moar-btn")
const $credit = document.querySelector("#credit")

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function onError(err) { console.log(err) }

function onImageData(json) {
  const index = getRandomInt(0, json.length)
  const image = json[index]
  $body.style['backgroundImage'] = "url("+image.urls.full+")"
  $body.style['backgroundColor'] = image.color
  $credit.href = image.user.links.html + "?utm_source=weather&utm_medium=referral&utm_campaign=api-credit"
  $credit.innerText = image.user.name

  console.log("onPictureData", json, index, image.color)
}

function fetchImageData(json) {
  console.log("onWeatherData:", json.weather[0].main)
  const key = "df24b455387acb47127898da32793c0e9b3a43b75af80a857feb17cffe4af7f0"
  const url = "https://api.unsplash.com/photos/"
  const query = json.weather[0].main

  fetch(`${url}?query=${query}&client_id=${key}`)
    .then(res => res.json(), onError)
    .then(onImageData)
    .catch(onError)
}

const fetchWeather = () => {
  const key = "a70fde74ccea0ae4b9d62142c9dece40"
  const url = "http://api.openweathermap.org/data/2.5/weather"
  const query = "London,uk"

  fetch(url + "?q=" + query + "&appid=" + key)
    .then(function (res) { return res.json() }, onError)
    .then(fetchImageData)
    .catch(onError)
}


(function (window) {
  $btn.addEventListener('click', fetchWeather)

  // fetchWeather()
}(this))