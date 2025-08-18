describe("Global Todos()", () => {
  const email = "taskertestuser@developedbybart.pl";
  const password = "password123";

  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
  });

  it("should successfully add a new global todo", () => {
    const globalTodoText = "New global task to add";

    cy.visit("/");

    cy.get('[data-testid="global-todos-trigger"]').click();

    cy.get('[data-testid="add-global-todo-button"]').click();
    cy.get('[data-testid="add-global-todo-input"]').type(globalTodoText);
    cy.get('[data-testid="add-global-todo-button"]').click();

    cy.contains(globalTodoText).should("exist");
  });

  it("should successfully edit an existing global todo", () => {
    const originalTodoText = "Global todo to edit";
    const editedTodoText = "Edited global todo";

    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="global-todos-trigger"]').click();

    cy.get('[data-testid="add-global-todo-button"]').click();

    cy.get('[data-testid="add-global-todo-input"]')
      .should("be.visible")
      .type(originalTodoText);

    cy.get('[data-testid="add-global-todo-button"]').click();

    cy.wait(2000);

    cy.contains(originalTodoText).should("exist");

    cy.contains(originalTodoText)
      .closest('div[class*="global-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.contains("button", /edit/i).click();

    cy.get('[data-testid="edit-global-todo-input"]')
      .should("be.visible")
      .clear({ force: true })
      .type(editedTodoText, { force: true });

    cy.get('[data-testid="edit-global-todo-button"]').click({ force: true });

    cy.contains(editedTodoText).should("exist");
    cy.contains(originalTodoText).should("not.exist");
  });

  it("should successfully delete a global todo", () => {
    const globalTodoText = "Global todo to delete";

    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="global-todos-trigger"]').click();

    cy.get('[data-testid="add-global-todo-button"]').click();
    cy.get('[data-testid="add-global-todo-input"]').type(globalTodoText);
    cy.get('[data-testid="add-global-todo-button"]').click();

    cy.contains(globalTodoText).should("exist");

    cy.contains(globalTodoText)
      .closest('div[class*="global-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.contains("button", /delete/i).click();

    cy.contains(globalTodoText).should("not.exist");
  });

  it("should successfully assign a global todo to a specific date", () => {
    const globalTodoText = "Global todo to assign";
    const targetDay = 25;
    const targetMonth = new Date().getMonth() + 1;
    const targetYear = new Date().getFullYear();

    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="global-todos-trigger"]').click();

    cy.get('[data-testid="add-global-todo-button"]').click();
    cy.get('[data-testid="add-global-todo-input"]').type(globalTodoText);
    cy.get('[data-testid="add-global-todo-button"]').click();

    cy.contains(globalTodoText).should("exist");

    cy.contains(globalTodoText)
      .closest('div[class*="global-todo-item"]')
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

    cy.contains(globalTodoText).should("not.exist");

    cy.navigateToDate(targetDay, targetMonth, targetYear);
    cy.contains(globalTodoText).should("exist");
  });

  it("should validate required fields when adding global todo", () => {
    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="global-todos-trigger"]').click();

    cy.get('[data-testid="add-global-todo-button"]').click();
    cy.get('[data-testid="add-global-todo-button"]').click();

    cy.get('[data-testid="global-todo-form-message"]').should("be.visible");
    cy.get('input[name="todo"]').should("be.visible");
  });
});
