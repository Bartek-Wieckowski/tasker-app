describe("Repeat Todo()", () => {
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

  it("should successfully repeat a todo to the next day", () => {
    const todoText = "Test todo to repeat";

    cy.createTodo(todoText);

    cy.repeatTodo(
      todoText,
      tomorrow.day,
      tomorrow.month,
      tomorrow.year,
      baseDate
    );

    cy.contains(todoText).should("exist");

    cy.navigateToDate(tomorrow.day, tomorrow.month, tomorrow.year);
    cy.contains(todoText).should("exist");
  });

  it("should repeat a todo with image", () => {
    const todoText = "Todo with image to repeat";
    const imageFixture = "test-image.jpg";

    cy.createTodoWithImage(todoText, imageFixture);

    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("exist");

    cy.repeatTodo(
      todoText,
      tomorrow.day,
      tomorrow.month,
      tomorrow.year,
      baseDate
    );

    cy.contains(todoText).should("exist");

    cy.navigateToDate(tomorrow.day, tomorrow.month, tomorrow.year);
    cy.contains(todoText).should("exist");
    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("exist")
      .and("be.visible");
  });

  it("should prevent repeating to past dates", () => {
    const todoText = "Todo that cannot be repeated to past";

    cy.createTodo(todoText);

    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="popover-trigger"]')
      .click();

    cy.contains("button", /repeat/i).click();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDay = yesterday.getDate();

    if (yesterday.getMonth() < new Date().getMonth()) {
      cy.get('[role="button"][name="previous-month"]').click();
    }

    cy.get(`[role="gridcell"]`).contains(yesterdayDay).should("be.disabled");
  });
});
