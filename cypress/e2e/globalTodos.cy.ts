describe("Global Todos()", () => {
  const baseDate = new Date();
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + 1);

  const today = {
    day: baseDate.getDate(),
    month: baseDate.getMonth() + 1,
    year: baseDate.getFullYear(),
  };

  const tomorrow = {
    day: targetDate.getDate(),
    month: targetDate.getMonth() + 1,
    year: targetDate.getFullYear(),
  };

  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
  });

  beforeEach(() => {
    cy.setupTestSession();
    cy.cleanupTodosOnly();
    cy.visit("/");
  });

  it("should successfully add a new global todo", () => {
    const globalTodoText = "New global task to add";

    cy.get('[data-testid="global-todos-trigger"]').first().click();

    cy.get('[data-testid="add-global-todo-input"]').type(globalTodoText);
    cy.get('[data-testid="add-global-todo-button"]').click();

    cy.contains(globalTodoText).should("exist");
  });

  it("should successfully edit an existing global todo", () => {
    const originalTodoText = "Global todo to edit";
    const editedTodoText = "Edited global todo";

    cy.get('[data-testid="global-todos-trigger"]').first().click();

    cy.get('[data-testid="add-global-todo-input"]')
      .should("be.visible")
      .type(originalTodoText);

    cy.get('[data-testid="add-global-todo-button"]').click();

    cy.wait(500);

    cy.contains(originalTodoText).should("exist");

    cy.contains(originalTodoText)
      .closest('div[class*="global-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.get('[data-testid="edit-global-todo-button-icon"]').click();

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

    cy.get('[data-testid="global-todos-trigger"]').first().click();

    cy.get('[data-testid="add-global-todo-input"]').type(globalTodoText);
    cy.get('[data-testid="add-global-todo-button"]').click();

    cy.contains(globalTodoText).should("exist");

    cy.contains(globalTodoText)
      .closest('div[class*="global-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.get('[data-testid="delete-global-todo-button-icon"]').click();

    cy.contains(globalTodoText).should("not.exist");
  });

  it("should successfully assign a global todo to a specific date", () => {
    const globalTodoText = "Global todo to assign";
    const targetMonth = new Date().getMonth() + 1;
    const targetYear = new Date().getFullYear();

    cy.get('[data-testid="global-todos-trigger"]').first().click();

    cy.get('[data-testid="add-global-todo-input"]').type(globalTodoText);
    cy.get('[data-testid="add-global-todo-button"]').click();

    cy.contains(globalTodoText).should("exist");

    cy.contains(globalTodoText)
      .closest('div[class*="global-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();
    cy.get('[data-testid="assign-global-todo-button-icon"]').click();

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
        .contains(new RegExp(`^${tomorrow.day}$`))
        .first()
        .should("be.visible")
        .should("not.be.disabled")
        .click();
    });

    cy.wait(500);

    cy.get('[data-testid="assign-global-todo-button"]').click();
    cy.get('[data-testid="toaster"]').find("button").click({ force: true });

    cy.contains(globalTodoText).should("not.exist");
    cy.get('div[role="dialog"]').type("{esc}");

    cy.navigateToDate(tomorrow.day, tomorrow.month, tomorrow.year);
    cy.contains(globalTodoText).should("exist");
  });

  it("should validate required fields when adding global todo", () => {
    cy.get('[data-testid="global-todos-trigger"]').first().click();

    cy.get('[data-testid="add-global-todo-button"]').click();

    cy.get('[data-testid="global-todo-form-message"]').should("be.visible");
    cy.get('input[name="todo"]').should("be.visible");
  });
});
