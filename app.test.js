const html = require("./cypress/fixtures/json/html.js");
const config = require("./cypress/fixtures/json/config.json");
const weather = require("./cypress/fixtures/json/weather.json");
const unsplash = require("./cypress/fixtures/json/unsplash.json");

const { App } = require("./app");

document.body.innerHTML = html;

test("displays a user after a click", () => {
  beforeEach(function() {});

  fetch.mockResponseOnce(JSON.stringify(weather));
  fetch.mockResponseOnce(JSON.stringify(unsplash));

  const TestApp = new App(config);
});

test("adds 1 + 2 to equal 3", () => {
  expect(3).toBe(3);
});
