// describe("Meteoropolis", function() {
//   it(".should() - assert that <title> is correct", function() {
//     cy.visit("index.html");
//     cy.title().should("include", "Meteoropolis");
//   });
// });

describe("Searching", () => {
  beforeEach(function() {
    cy.visit("index.html");
  });

  it("Has a prefilled search", () => {
    cy.get("#search-tf").should("have.value", "London, UK");
  });
  it("Does not submit if there is no term entered", () => {
    // cy.get("#search-tf").clear();
    // cy.get("#search").submit();
    // TODO: write test that looks for fetch not being called
  });
});
