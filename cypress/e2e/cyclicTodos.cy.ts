describe("Cyclic Todos()", () => {
  const email = "taskertestuser@developedbybart.pl";
  const password = "password123";

  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
  });

  it("should successfully add a new cyclic todo", () => {
    const cyclicTodoText = "New cyclic task to add";

    cy.visit("/");

    cy.get('[data-testid="cyclic-todos-trigger"]').click();

    cy.get('[data-testid="add-cyclic-todo-button"]').click();
    cy.get('[data-testid="add-cyclic-todo-input"]').type(cyclicTodoText);
    cy.get('[data-testid="add-cyclic-todo-button"]').click();

    cy.contains(cyclicTodoText).should("exist");
  });

  it("should successfully edit an existing cyclic todo", () => {
    const originalTodoText = "Cyclic todo to edit";
    const editedTodoText = "Edited cyclic todo";

    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="cyclic-todos-trigger"]').click();

    cy.get('[data-testid="add-cyclic-todo-button"]').click();

    cy.get('[data-testid="add-cyclic-todo-input"]')
      .should("be.visible")
      .type(originalTodoText);

    cy.get('[data-testid="add-cyclic-todo-button"]').click();

    cy.wait(2000);

    cy.contains(originalTodoText).should("exist");

    cy.contains(originalTodoText)
      .closest('div[class*="cyclic-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.contains("button", /edit/i).click();

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

    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="cyclic-todos-trigger"]').click();

    cy.get('[data-testid="add-cyclic-todo-button"]').click();
    cy.get('[data-testid="add-cyclic-todo-input"]').type(cyclicTodoText);
    cy.get('[data-testid="add-cyclic-todo-button"]').click();

    cy.contains(cyclicTodoText).should("exist");

    cy.contains(cyclicTodoText)
      .closest('div[class*="cyclic-todo-item"]')
      .find('[data-testid="dropdown-trigger"]')
      .click();

    cy.contains("button", /delete/i).click();

    cy.contains(cyclicTodoText).should("not.exist");
  });

  it("should validate required fields when adding cyclic todo", () => {
    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="cyclic-todos-trigger"]').click();

    cy.get('[data-testid="add-cyclic-todo-button"]').click();
    cy.get('[data-testid="add-cyclic-todo-button"]').click();

    cy.get('[data-testid="cyclic-todo-form-message"]').should("be.visible");
    cy.get('input[name="todo"]').should("be.visible");
  });
});
