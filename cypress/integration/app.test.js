const weatherJSON = require("../fixtures/json/weather.json");
const unsplashJSON = require("../fixtures/json/unsplash.json");

// Cache references to the first and last values of Unsplash
const getImages = json => {
  return [json[0], json[json.length - 1]].map(image => image.urls.regular);
};

const thumbs = {
  first: {
    srcMain:
      "https://images.unsplash.com/photo-1430263326118-b75aa0da770b?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=3b16decd494cbb8d3be2af781d53baca",
    srcThumb:
      "https://images.unsplash.com/photo-1430263326118-b75aa0da770b?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=8777beb510cb4e27de01d066f49400c1",
    author: "Andrej Chudy",
    bg: "rgb(164, 178, 201)"
  },
  next: {
    srcMain:
      "https://images.unsplash.com/photo-1495511167051-13bb07bde85b?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=720d0c4a99814d09fb6223fff64e1f50",
    srcThumb:
      "https://images.unsplash.com/photo-1495511167051-13bb07bde85b?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=0395d4209149707e68f58c1c86336562",
    author: "William Bout",
    bg: "rgb(80, 31, 27)"
  },
  last: {
    srcMain:
      "https://images.unsplash.com/photo-1495110823793-aa4ed8127d6e?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=a9586ae9c8c59316d9b6117f4891edb8",
    srcThumb:
      "https://images.unsplash.com/photo-1495110823793-aa4ed8127d6e?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=b0e0265dc190bd2981b92b20b186d27a",
    author: "Michał Kubalczyk",
    bg: "rgb(24, 29, 29)"
  }
};

function onThumbSelect(thumb) {
  return function() {
    it("Sets the source of the main image", function() {
      cy.get("#photo img").should("have.attr", "src", thumb.srcMain);
    });

    it("updates the photographer credit", function() {
      cy.get("#credit-user").should("have.text", thumb.author);
    });

    it("Sets the colour of the body to the correct colour", function() {
      cy
        .get("body")
        .should("have.attr", "style", `background-color: ${thumb.bg};`);
    });
  };
}

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

describe("Data fetching", function() {
  beforeEach(function() {
    let counter = 0;

    this.stubbedImages = getImages(unsplashJSON.results);

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

  context("Displays stubbed data", function() {
    context("It updates the UI", function() {
      it("updates the conditions label", function() {
        cy.get("#conditions").should("have.text", "Clear STUBBED");
      });

      it("displays the correct number of thumbnails", function() {
        cy
          .get("#thumbs")
          .children(".thumbs__link")
          .should("have.length", 10);
      });

      it("creates thumbnail component instances", function() {
        cy.get("#thumbs img:first").should("have.class", "thumbs__link__img");
      });
    });

    context("It displays the first image", onThumbSelect(thumbs.first));
  });

  context("Handles clicks on thumbs", function() {
    beforeEach(function() {
      cy.get("#thumbs a:last").click();
    });

    context("It displays the appropriate image", onThumbSelect(thumbs.last));
  });
});
