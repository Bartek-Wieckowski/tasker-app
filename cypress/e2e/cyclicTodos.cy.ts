describe("Cyclic Todos()", () => {
  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
  });

  beforeEach(() => {
    cy.setupTestSession();
    cy.cleanupTodosOnly();
    cy.visit("/");
  });

  it("should successfully add a new cyclic todo", () => {
    const cyclicTodoText = "New cyclic task to add";

    cy.get('[data-testid="cyclic-todos-trigger"]').first().click();

    cy.get('[data-testid="add-cyclic-todo-button"]').first().click();
    cy.get('[data-testid="add-cyclic-todo-input"]').type(cyclicTodoText);
    cy.get('[data-testid="add-cyclic-todo-button"]').first().click();

    cy.contains(cyclicTodoText).should("exist");
  });

  it("should successfully edit an existing cyclic todo", () => {
    const originalTodoText = "Cyclic todo to edit";
    const editedTodoText = "Edited cyclic todo";

    cy.get('[data-testid="cyclic-todos-trigger"]').first().click();

    cy.get('[data-testid="add-cyclic-todo-button"]').first().click();

    cy.get('[data-testid="add-cyclic-todo-input"]')
      .should("be.visible")
      .type(originalTodoText);

    cy.get('[data-testid="add-cyclic-todo-button"]').first().click();

    cy.wait(2000);

    cy.contains(originalTodoText).should("exist");

    cy.contains(originalTodoText)
      .closest('div[class*="cyclic-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.get('[data-testid="edit-cyclic-todo-button-icon"]').click();

    cy.get('[data-testid="edit-cyclic-todo-input"]')
      .should("be.visible")
      .clear({ force: true })
      .type(editedTodoText, { force: true });

    cy.get('[data-testid="edit-cyclic-todo-button"]').click({ force: true });

    cy.contains(editedTodoText).should("exist");
    cy.contains(originalTodoText).should("not.exist");
  });

  it("should successfully delete a cyclic todo", () => {
    const cyclicTodoText = "Cyclic todo to delete";

    cy.get('[data-testid="cyclic-todos-trigger"]').first().click();

    cy.get('[data-testid="add-cyclic-todo-button"]').first().click();
    cy.get('[data-testid="add-cyclic-todo-input"]').type(cyclicTodoText);
    cy.get('[data-testid="add-cyclic-todo-button"]').first().click();

    cy.contains(cyclicTodoText).should("exist");

    cy.contains(cyclicTodoText)
      .closest('div[class*="cyclic-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.get('[data-testid="delete-cyclic-todo-button-icon"]').click();

    cy.contains(cyclicTodoText).should("not.exist");
  });

  it("should validate required fields when adding cyclic todo", () => {
    cy.get('[data-testid="cyclic-todos-trigger"]').first().click();

    cy.get('[data-testid="add-cyclic-todo-button"]').first().click();

    cy.get('[data-testid="cyclic-todo-form-message"]').should("be.visible");
    cy.get('input[name="todo"]').should("be.visible");
  });
});
