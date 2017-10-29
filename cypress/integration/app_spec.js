const weatherJSON = require("../fixtures/json/weather.json");
const unsplashJSON = require("../fixtures/json/unsplash-photos.json");

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

  describe("Data fetching", () => {
    beforeEach(function() {
      this.fetchDeferred = deferred();
      // this.fetchImagesDeferred = deferred();

      cy.visit("index.html", {
        onBeforeLoad(win) {
          cy.stub(win, "fetch").returns(this.fetchDeferred.promise);
        }
      });
    });

    describe("Fetch weather", function() {
      let counter = 0;

      beforeEach(function() {
        this.fetchDeferred.resolve({
          json() {
            return counter++ === 0 ? weatherJSON : unsplashJSON;
          },
          ok: true
        });
      });

      it("stubs data", function() {
        // cy.window().its('App')
      });
    });
  });
});
