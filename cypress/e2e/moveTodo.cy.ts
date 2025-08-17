describe("Move Todo()", () => {
  const email = "taskertestuser@developedbybart.pl";
  const password = "password123";
  const targetYear = new Date().getFullYear();
  const targetMonth = new Date().getMonth() + 1;
  const targetDay = 25;

  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
  });

  it("should successfully move a todo to a new date", () => {
    const todoText = "Test todo to move";

    cy.visit("/");
    cy.createTodo(todoText);
    cy.moveTodoToDate(todoText, targetDay, targetMonth, targetYear);
    cy.contains(todoText).should("not.exist");
    cy.navigateToDate(targetDay, targetMonth, targetYear);
    cy.contains(todoText).should("exist");
  });

  it("should not allow moving completed todos", () => {
    cy.login(email, password);
    cy.visit("/");

    cy.navigateToDate(targetDay, targetMonth, targetYear);
    cy.get('[data-testid="checkbox-to-change-status-todo"]').click();
    cy.get('div[class*="todo-item-card"]')
      .find('[data-testid="popover-trigger"]')
      .click();
    cy.contains("button", /move/i).should("be.disabled");
  });

  it("should prevent moving to past dates", () => {
    cy.login(email, password);
    cy.visit("/");

    cy.navigateToDate(targetDay, targetMonth, targetYear);
    cy.get('[data-testid="checkbox-to-change-status-todo"]').click();
    cy.get('div[class*="todo-item-card"]')
      .find('[data-testid="popover-trigger"]')
      .click();
    cy.contains("button", /move/i).click();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDay = yesterday.getDate();

    if (yesterday.getMonth() < new Date().getMonth()) {
      cy.get('[role="button"][name="previous-month"]').click();
    }

    cy.get(`[role="gridcell"]`).contains(yesterdayDay).should("be.disabled");
  });

  it("should move todo with image successfully", () => {
    const todoText = "Todo with image to move";
    const imageFixture = "test-image.jpg";

    cy.login(email, password);
    cy.visit("/");

    cy.createTodoWithImage(todoText, imageFixture);

    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("exist");

    cy.moveTodoToDate(todoText, targetDay, targetMonth, targetYear);
    cy.contains(todoText).should("not.exist");
    cy.navigateToDate(targetDay, targetMonth, targetYear);
    cy.contains(todoText).should("exist");
    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("exist")
      .and("be.visible");
  });
});
