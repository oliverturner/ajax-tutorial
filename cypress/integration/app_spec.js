describe("Meteoropolis", function() {
  it("Does not do much!", function() {
    expect(true).to.equal(true);
  });

  it(".should() - assert that <title> is correct", function() {
    cy.visit("http://localhost:5000/");
    cy.title().should("include", "Meteoropolis");
  });

  it("stubs data", () => {
    cy.fixture("json/weather.json").as("weatherJSON");
    cy.fixture("json/unsplash.json").as("unsplashJSON");

    // enable response stubbing
    cy.server();

    cy
      .route({
        method: "GET",
        url: "https://api.openweathermap.org/*",
        response: "@weatherJSON"
      })
      .as("getWeather");

    cy
      .route({
        method: "GET",
        url: "https://api.unsplash.com/*",
        response: "@unsplashJSON"
      })
      .as("getImages");

    cy.visit("http://localhost:5000/");

    // cy.wait(["@getWeather", "@getImages"]);
  });
});
