describe("Delegate Todo()", () => {
  const email = "taskertestuser@developedbybart.pl";
  const password = "password123";

  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
  });

  it("should successfully delegate a basic todo", () => {
    const todoText = "Test todo to delegate";

    cy.visit("/");
    cy.createTodo(todoText);

    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="popover-trigger"]')
      .click();

    cy.contains("button", /delegate/i).click();

    cy.contains(todoText).should("not.exist");

    cy.get('[data-testid="delegated-todos-trigger"]').click();
    cy.contains(todoText).should("exist");
  });

  it("should delegate multiple todos", () => {
    const todos = [
      "First todo to delegate",
      "Second todo to delegate",
      "Third todo to delegate",
    ];

    cy.login(email, password);
    cy.visit("/");

    todos.forEach((todoText) => {
      cy.createTodo(todoText);
    });

    todos.forEach((todoText) => {
      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /delegate/i).click({ force: true });

      cy.contains(todoText).should("not.exist");
    });

    cy.get('[data-testid="delegated-todos-trigger"]').click();
    todos.forEach((todoText) => {
      cy.contains(todoText).should("exist");
    });
  });
});
