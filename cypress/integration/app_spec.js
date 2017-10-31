const weatherJSON = require("../fixtures/json/weather.json");
const unsplashJSON = require("../fixtures/json/unsplash-photos.json");

const getImages = json => {
  return [json[0], json[json.length - 1]].map(image => image.urls.regular);
};

function deferred() {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
} 

describe("Meteoropolis", function() {
  it(".should() - assert that <title> is correct", function() {
    cy.visit("index.html");
    cy.title().should("include", "Meteoropolis");
  });
});

describe("Data fetching", () => {
  beforeEach(function() {
    let counter = 0;

    this.stubbedImages = getImages(unsplashJSON);

    this.fetchDeferred = deferred();
    this.fetchDeferred.resolve({
      json() {
        return counter++ === 0 ? weatherJSON : unsplashJSON;
      },
      ok: true
    });

    cy.visit("index.html", {
      onBeforeLoad(win) {
        cy.stub(win, "fetch").returns(this.fetchDeferred.promise);
      }
    });
  });

  it("Displays stubbed data", function() {
    cy.get("#photo img").should("have.attr", "src", this.stubbedImages[0]);
    cy.get("#conditions").should("have.text", "Clear STUBBED");
    cy.get("#credit-user").should("have.text", "Alessio Lin");
    cy.get("#thumbs img:first").should("have.class", "thumbs__link__img");
  });

  it("Handles clicks on thumbs", function() {
    cy.get("#thumbs a:last").click();
    cy.get("#photo img").should("have.attr", "src", this.stubbedImages[1]);
  });
});
