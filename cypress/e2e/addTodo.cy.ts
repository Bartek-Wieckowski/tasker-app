describe("Add Todo()", () => {
  const email = "taskertestuser@developedbybart.pl";
  const password = "password123";

  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
  });

  it("should successfully add a basic todo", () => {
    const todoText = "Test todo to add";

    cy.visit("/");
    cy.createTodo(todoText);
    cy.contains(todoText).should("exist");
  });

  it("should successfully add a todo with image", () => {
    const todoText = "Todo with image to add";
    const imageFixture = "test-image.jpg";

    cy.login(email, password);
    cy.visit("/");

    cy.createTodoWithImage(todoText, imageFixture);
    cy.contains(todoText).should("exist");
    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("exist")
      .and("be.visible");
  });

  it("should add multiple todos", () => {
    const todos = ["First todo", "Second todo", "Third todo"];

    cy.login(email, password);
    cy.visit("/");

    todos.forEach((todoText) => {
      cy.createTodo(todoText);
      cy.contains(todoText).should("exist");
    });
  });

  it("should not add todo with long text and show error message", () => {
    const longTodoText =
      "This is a very long todo text that should be handled properly by the application. It contains multiple sentences and should not break the UI or cause any issues with the database storage.";

    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="add-todo-button"]').click();
    cy.get('input[name="todo"]').first().type(longTodoText);
    cy.get('button[type="submit"]').click();

    cy.contains(longTodoText).should("not.exist");

    cy.get('[data-testid="todo-form-message"]').should("be.visible");
    cy.get('input[name="todo"]').should("be.visible");
  });

  it("should add todo with todo more content and visit its detail page", () => {
    const todoText = "Todo with more content test";
    const todoMoreContent =
      "This is the additional content for the todo that should be visible on the detail page";

    cy.intercept("POST", "**/rest/v1/todos*").as("createTodo");

    cy.login(email, password);
    cy.visit("/");

    cy.get('[data-testid="add-todo-button"]').click();
    cy.get('input[name="todo"]').type(todoText);
    cy.get('textarea[name="todo_more_content"]').type(todoMoreContent);
    cy.get('button[type="submit"]').click();

    // Wait for the todo to be created and get the ID
    cy.wait("@createTodo").then((interception) => {
      const todoId = interception.response?.body?.id;
      expect(todoId).to.exist;

      cy.contains(todoText).should("exist");
      cy.visit(`/todo/${todoId}`);
      cy.contains(todoText).should("exist");
      cy.contains(todoMoreContent).should("exist");
      cy.url().should("include", `/todo/${todoId}`);
    });
  });

  it("should add todo and verify it appears in the correct date", () => {
    const todoText = "Todo for today";
    const today = new Date();
    const currentDay = today.getDate();

    cy.login(email, password);
    cy.visit("/");
    cy.createTodo(todoText);

    cy.get('[data-testid="date-picker-button"]').click();
    cy.get(`[role="gridcell"]`)
      .contains(currentDay)
      .should("have.class", "bg-primary");
    cy.contains(todoText).should("exist");
  });

  it("should add todo with image and verify image preview", () => {
    const todoText = "Todo with image preview";
    const imageFixture = "test-image-update.jpg";

    cy.login(email, password);
    cy.visit("/");

    cy.createTodoWithImage(todoText, imageFixture);

    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("exist")
      .and("be.visible");
  });

  it("should add todo without image when image field is left empty", () => {
    const todoText = "Todo without image";

    cy.login(email, password);
    cy.visit("/");
    cy.get('[data-testid="add-todo-button"]').click();
    cy.get('input[name*="todo"]').first().type(todoText);
    cy.get('button[type="submit"]').click();

    cy.contains(todoText).should("exist");
    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("not.exist");
  });
});
