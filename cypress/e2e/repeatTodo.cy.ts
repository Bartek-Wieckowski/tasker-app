describe("Repeat Todo()", () => {
  const email = "taskertestuser@developedbybart.pl";
  const password = "password123";
  const currentDate = new Date();
  const nextDay = new Date(currentDate);
  nextDay.setDate(currentDate.getDate() + 1);

  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
  });

  it("should successfully repeat a todo to the next day", () => {
    const todoText = "Test todo to repeat";

    cy.visit("/");
    cy.createTodo(todoText);

    cy.repeatTodo(
      todoText,
      nextDay.getDate(),
      nextDay.getMonth() + 1,
      nextDay.getFullYear(),
      currentDate
    );

    cy.contains(todoText).should("exist");

    cy.navigateToDate(
      nextDay.getDate(),
      nextDay.getMonth() + 1,
      nextDay.getFullYear()
    );
    cy.contains(todoText).should("exist");
  });

  it("should repeat a todo with image", () => {
    const todoText = "Todo with image to repeat";
    const imageFixture = "test-image.jpg";

    cy.login(email, password);
    cy.visit("/");

    cy.createTodoWithImage(todoText, imageFixture);

    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("exist");

    cy.repeatTodo(
      todoText,
      nextDay.getDate(),
      nextDay.getMonth() + 1,
      nextDay.getFullYear(),
      currentDate
    );

    cy.contains(todoText).should("exist");

    cy.navigateToDate(
      nextDay.getDate(),
      nextDay.getMonth() + 1,
      nextDay.getFullYear()
    );
    cy.contains(todoText).should("exist");
    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="todo-item-has-image"]')
      .should("exist")
      .and("be.visible");
  });

  it("should prevent repeating to past dates", () => {
    const todoText = "Todo that cannot be repeated to past";

    cy.login(email, password);
    cy.visit("/");
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
