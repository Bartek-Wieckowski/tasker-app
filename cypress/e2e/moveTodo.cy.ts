describe("Move Todo()", () => {
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

  it("should successfully move a todo to a new date", () => {
    const todoText = "Test todo to move";

    cy.createTodo(todoText);
    cy.moveTodoToDate(todoText, tomorrow.day, tomorrow.month, tomorrow.year);
    cy.contains(todoText).should("not.exist");
    cy.navigateToDate(tomorrow.day, tomorrow.month, tomorrow.year);
    cy.contains(todoText).should("exist");
  });

  it("should not allow moving completed todos", () => {
    const todoText = "Test todo to move";

    cy.createTodo(todoText);
    cy.get('[data-testid="checkbox-to-change-status-todo"]').first().click();
    cy.wait(500);
    cy.get('div[class*="todo-item-card"]')
      .first()
      .find('[data-testid="popover-trigger"]')
      .click();
    cy.contains("button", /move/i).should("be.disabled");
  });

  it("should prevent moving to past dates", () => {
    const todoText = "Test todo to move";

    cy.createTodo(todoText);

    cy.get('div[class*="todo-item-card"]')
      .first()
      .find('[data-testid="popover-trigger"]')
      .click();
    cy.contains("button", /move/i).should("be.enabled").click();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDay = yesterday.getDate();

    const currentMonth = new Date().getMonth();
    if (yesterday.getMonth() < currentMonth) {
      cy.get('[role="button"][name="previous-month"]').click();
    }

    cy.get('[role="grid"]')
      .contains("button", new RegExp(`^${yesterdayDay}$`))
      .should("be.disabled");
  });

  it("should move todo with image successfully", () => {
    const todoText = "Todo with image to move";
    const imageFixture = "test-image.jpg";

    cy.createTodoWithImage(todoText, imageFixture);

    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("exist");

    cy.moveTodoToDate(todoText, tomorrow.day, tomorrow.month, tomorrow.year);
    cy.contains(todoText).should("not.exist");
    cy.navigateToDate(tomorrow.day, tomorrow.month, tomorrow.year);
    cy.contains(todoText).should("exist");
    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("exist")
      .and("be.visible");
  });
});
