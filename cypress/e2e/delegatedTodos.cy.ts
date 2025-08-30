describe("Delegated Todos()", () => {
  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
  });

  beforeEach(() => {
    cy.setupTestSession();
    cy.cleanupTodosOnly();
    cy.visit("/");
  });

  it("should successfully add a new delegated todo", () => {
    const delegatedTodoText = "New delegated task to add";

    cy.get('[data-testid="delegated-todos-trigger"]').first().click();

    cy.get('[data-testid="add-delegated-todo-button"]').first().click();
    cy.get('[data-testid="add-delegated-todo-input"]').type(delegatedTodoText);
    cy.get('[data-testid="add-delegated-todo-button"]').first().click();

    cy.contains(delegatedTodoText).should("exist");
  });

  it("should successfully edit an existing delegated todo", () => {
    const originalTodoText = "Delegated todo to edit";
    const editedTodoText = "Edited delegated todo";

    cy.get('[data-testid="delegated-todos-trigger"]').first().click();

    cy.get('[data-testid="add-delegated-todo-button"]').first().click();

    cy.get('[data-testid="add-delegated-todo-input"]')
      .should("be.visible")
      .type(originalTodoText);

    cy.get('[data-testid="add-delegated-todo-button"]').first().click();

    cy.wait(500);

    cy.contains(originalTodoText).should("exist");

    cy.contains(originalTodoText)
      .closest('div[class*="delegated-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.get('[data-testid="edit-delegated-todo-button-icon"]').click();

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

    cy.get('[data-testid="delegated-todos-trigger"]').first().click();

    cy.get('[data-testid="add-delegated-todo-button"]').first().click();
    cy.get('[data-testid="add-delegated-todo-input"]').type(delegatedTodoText);
    cy.get('[data-testid="add-delegated-todo-button"]').first().click();

    cy.contains(delegatedTodoText).should("exist");

    cy.contains(delegatedTodoText)
      .closest('div[class*="delegated-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.get('[data-testid="delete-delegated-todo-button-icon"]').click();

    cy.contains(delegatedTodoText).should("not.exist");
  });

  it("should successfully assign a delegated todo to a specific date", () => {
    const delegatedTodoText = "Delegated todo to assign";
    const targetDay = new Date().getDate();
    const targetMonth = new Date().getMonth() + 1;
    const targetYear = new Date().getFullYear();

    cy.get('[data-testid="delegated-todos-trigger"]').first().click();

    cy.get('[data-testid="add-delegated-todo-input"]').type(delegatedTodoText);
    cy.get('[data-testid="add-delegated-todo-button"]').first().click();

    cy.contains(delegatedTodoText).should("exist");

    cy.contains(delegatedTodoText)
      .closest('div[class*="delegated-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();
    cy.get('[data-testid="assign-delegated-todo-button-icon"]').click();

    if (
      targetMonth > new Date().getMonth() + 1 ||
      targetYear > new Date().getFullYear()
    ) {
      cy.get('[role="button"][name="next-month"]').click();
    }

    cy.get('[role="grid"]').within(() => {
      cy.get(`button:not([disabled]):not(.disabled)`)
        .not('[aria-disabled="true"]')
        .not(".day-outside")
        .not(".rdp-day_outside")
        .contains(new RegExp(`^${targetDay}$`))
        .first()
        .should("be.visible")
        .should("not.be.disabled")
        .click();
    });

    cy.get('[data-testid="assign-delegated-todo-button"]').click();

    cy.contains(delegatedTodoText).should("not.exist");
    cy.wait(500);
    cy.get('div[role="dialog"]').type("{esc}");

    cy.navigateToDate(targetDay, targetMonth, targetYear);
    cy.contains(delegatedTodoText).should("exist");
  });

  it("should validate required fields when adding delegated todo", () => {
    cy.get('[data-testid="delegated-todos-trigger"]').first().click();

    cy.get('[data-testid="add-delegated-todo-button"]').first().click();

    cy.get('[data-testid="delegated-todo-form-message"]').should("be.visible");
    cy.get('input[name="todo"]').should("be.visible");
  });
});
