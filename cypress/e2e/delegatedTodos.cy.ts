describe("Delegated Todos()", () => {
  const email = "taskertestuser@developedbybart.pl";
  const password = "password123";

  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
  });

  it("should successfully add a new delegated todo", () => {
    const delegatedTodoText = "New delegated task to add";

    cy.visit("/");

    cy.get('[data-testid="delegated-todos-trigger"]').click();

    cy.get('[data-testid="add-delegated-todo-button"]').click();
    cy.get('[data-testid="add-delegated-todo-input"]').type(delegatedTodoText);
    cy.get('[data-testid="add-delegated-todo-button"]').click();

    cy.contains(delegatedTodoText).should("exist");
  });

  it("should successfully edit an existing delegated todo", () => {
    const originalTodoText = "Delegated todo to edit";
    const editedTodoText = "Edited delegated todo";

    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="delegated-todos-trigger"]').click();

    cy.get('[data-testid="add-delegated-todo-button"]').click();

    cy.get('[data-testid="add-delegated-todo-input"]')
      .should("be.visible")
      .type(originalTodoText);

    cy.get('[data-testid="add-delegated-todo-button"]').click();

    cy.wait(2000);

    cy.contains(originalTodoText).should("exist");

    cy.contains(originalTodoText)
      .closest('div[class*="delegated-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.contains("button", /edit/i).click();

    cy.get('[data-testid="edit-delegated-todo-input"]')
      .should("be.visible")
      .clear({ force: true })
      .type(editedTodoText, { force: true });

    cy.get('[data-testid="edit-delegated-todo-button"]').click({ force: true });

    cy.contains(editedTodoText).should("exist");
    cy.contains(originalTodoText).should("not.exist");
  });

  it("should successfully delete a delegated todo", () => {
    const delegatedTodoText = "Delegated todo to delete";

    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="delegated-todos-trigger"]').click();

    cy.get('[data-testid="add-delegated-todo-button"]').click();
    cy.get('[data-testid="add-delegated-todo-input"]').type(delegatedTodoText);
    cy.get('[data-testid="add-delegated-todo-button"]').click();

    cy.contains(delegatedTodoText).should("exist");

    cy.contains(delegatedTodoText)
      .closest('div[class*="delegated-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.contains("button", /delete/i).click();

    cy.contains(delegatedTodoText).should("not.exist");
  });

  it("should successfully assign a delegated todo to a specific date", () => {
    const delegatedTodoText = "Delegated todo to assign";
    const targetDay = 25;
    const targetMonth = new Date().getMonth() + 1;
    const targetYear = new Date().getFullYear();

    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="delegated-todos-trigger"]').click();

    cy.get('[data-testid="add-delegated-todo-button"]').click();
    cy.get('[data-testid="add-delegated-todo-input"]').type(delegatedTodoText);
    cy.get('[data-testid="add-delegated-todo-button"]').click();

    cy.contains(delegatedTodoText).should("exist");

    cy.contains(delegatedTodoText)
      .closest('div[class*="delegated-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();
    cy.contains("button", /assign to day/i).click();

    if (
      targetMonth > new Date().getMonth() + 1 ||
      targetYear > new Date().getFullYear()
    ) {
      cy.get('[role="button"][name="next-month"]').click();
    }

    cy.get(`[role="gridcell"]`).contains(targetDay).click();
    cy.wait(1000);

    cy.get('div[role="dialog"]').type("{esc}");

    cy.contains(delegatedTodoText).should("not.exist");

    cy.navigateToDate(targetDay, targetMonth, targetYear);
    cy.contains(delegatedTodoText).should("exist");
  });

  it("should validate required fields when adding delegated todo", () => {
    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="delegated-todos-trigger"]').click();

    cy.get('[data-testid="add-delegated-todo-button"]').click();
    cy.get('[data-testid="add-delegated-todo-button"]').click();

    cy.get('[data-testid="delegated-todo-form-message"]').should("be.visible");
    cy.get('input[name="todo"]').should("be.visible");
  });
});
