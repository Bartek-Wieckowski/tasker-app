describe("Delete Todo()", () => {
  const email = "taskertestuser@developedbybart.pl";
  const password = "password123";

  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
  });

  it("should successfully delete a todo", () => {
    const todoText = "Test todo to delete";

    cy.visit("/");

    cy.createTodo(todoText);
    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="popover-trigger"]')
      .click();

    cy.contains("button", /delete/i).click();
    cy.contains(todoText).should("not.exist");
  });

  it("should successfully delete a todo with image", () => {
    const todoText = "Todo with image to delete";
    const imageFixture = "test-image.jpg";

    cy.login(email, password);
    cy.visit("/");

    cy.createTodoWithImage(todoText, imageFixture);

    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("exist");

    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="popover-trigger"]')
      .click();

    cy.contains("button", /delete/i).click();
    cy.contains(todoText).should("not.exist");
  });
});
