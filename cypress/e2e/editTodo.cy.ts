describe("Edit Todo()", () => {
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

  describe("Basic Todo Editing", () => {
    it("should edit todo text successfully", () => {
      const originalText = "Original todo text";
      const editedText = "Edited todo text";

      cy.createTodo(originalText);

      cy.contains(originalText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('input[name*="todo"]').first().clear().type(editedText);

      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });

      cy.contains(editedText).should("exist");
      cy.contains(originalText).should("not.exist");
    });

    it("should edit todo more content successfully", () => {
      const todoText = "Todo with content";
      const originalContent = "Original content";
      const editedContent = "Edited content";

      cy.get('[data-testid="add-todo-button"]').first().click();
      cy.get('input[name*="todo"]').type(todoText);
      cy.get('textarea[name*="todo_more_content"]').type(originalContent);
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('textarea[name*="todo_more_content"]').clear().type(editedContent);
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });

      cy.wait(500);

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("a", /details/i).click();

      cy.wait(500);

      cy.contains(editedContent).should("exist");
      cy.contains(originalContent).should("not.exist");
    });

    it("should add image to existing todo", () => {
      const todoText = "Todo without image";

      cy.createTodo(todoText);

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .within(() => {
          cy.get('[data-testid="todo-item-has-image"]').should("not.exist");
        });

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('[id="todoPhoto"]').click();
      cy.get('input[type="file"]').selectFile(
        "cypress/fixtures/test-image.jpg",
        {
          force: true,
        }
      );

      cy.get('[data-testid="image-preview"]', { timeout: 10000 })
        .scrollIntoView()
        .should("exist")
        .and("be.visible");

      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .within(() => {
          cy.get('[data-testid="todo-item-has-image"]', {
            timeout: 10000,
          }).should("exist");
        });
    });

    it("should replace existing image with new image", () => {
      const todoText = "Todo with replaceable image";

      cy.createTodoWithImage(todoText, "test-image.jpg");

      cy.contains(todoText).should("exist");

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .should("exist")
        .and("have.attr", "data-image-url");

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .invoke("attr", "data-image-url")
        .then((originalUrl) => {
          // cy.log("Original image URL:", originalUrl);
          cy.wrap(originalUrl).as("originalImageUrl");
        });

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('input[id="edit-image"]').click();

      cy.wait(100);

      cy.get('input[type="file"]').selectFile(
        "cypress/fixtures/test-image-update.jpg",
        { force: true }
      );

      cy.get('[data-testid="image-preview"]')
        .scrollIntoView()
        .should("exist")
        .and("be.visible");

      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });

      cy.wait(1000);

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .should("exist")
        .and("have.attr", "data-image-url");

      cy.get("@originalImageUrl").then((originalImageUrl) => {
        cy.contains(todoText)
          .closest('div[class*="todo-item-card"]')
          .find('[data-testid="todo-item-has-image"]')
          .should("have.attr", "data-image-url")
          .and("not.equal", originalImageUrl)
          .then((newUrl) => {
            cy.log("New image URL:", newUrl);
            cy.log("Original image URL:", originalImageUrl);
            expect(newUrl).to.not.be.empty;
            expect(newUrl).to.not.equal(originalImageUrl);
          });
      });

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .click({ force: true });
    });

    it("should delete image from todo", () => {
      const todoText = "Todo with deletable image";

      cy.createTodoWithImage(todoText, "test-image.jpg");

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .scrollIntoView()
        .should("be.visible")
        .should("exist");

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('input[id="delete-image"]').click();
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .should("not.exist");
    });

    it("should handle image operations with text changes", () => {
      const originalText = "Original with image";
      const editedText = "Edited with new image";

      cy.createTodoWithImage(originalText, "test-image.jpg");

      cy.contains(originalText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('input[name*="todo"]').first().clear().type(editedText);

      cy.get('input[id="edit-image"]').click();
      cy.get('input[type="file"]').selectFile(
        "cypress/fixtures/test-image-update.jpg",
        {
          force: true,
        }
      );

      cy.get('[data-testid="image-preview"]', { timeout: 10000 })
        .scrollIntoView()
        .should("exist")
        .and("be.visible");
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });

      cy.contains(editedText).should("exist");
      cy.contains(originalText).should("not.exist");
      cy.contains(editedText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .scrollIntoView()
        .should("exist")
        .and("be.visible");
    });
  });

  describe("Repeated Todos Editing", () => {
    it("should edit original todo and propagate changes to repeated todos", () => {
      const originalText = "Original repeated todo";
      const editedText = "Edited repeated todo";

      cy.createTodo(originalText);

      cy.repeatTodo(
        originalText,
        tomorrow.day,
        tomorrow.month,
        tomorrow.year,
        baseDate
      );

      cy.navigateToDate(today.day, today.month, today.year);

      cy.contains(originalText).should("exist");

      cy.contains(originalText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('input[name*="todo"]').first().clear();
      cy.get('input[name*="todo"]').first().type(editedText);

      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });

      cy.contains(editedText).should("exist");
      cy.contains(originalText).should("not.exist");

      cy.navigateToDate(tomorrow.day, tomorrow.month, tomorrow.year);

      cy.contains(editedText).should("exist");
      cy.contains(originalText).should("not.exist");
    });

    it("should make repeated todo independent when edited", () => {
      const originalText = "Repeated todo to become independent";
      const independentText = "Now independent todo";

      cy.createTodo(originalText);

      cy.repeatTodo(
        originalText,
        tomorrow.day,
        tomorrow.month,
        tomorrow.year,
        baseDate
      );

      cy.navigateToDate(tomorrow.day, tomorrow.month, tomorrow.year);

      cy.contains(originalText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('input[name*="todo"]').first().clear().type(independentText);

      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });

      cy.contains(independentText).should("exist");

      cy.navigateToDate(today.day, today.month, today.year);
      cy.contains(originalText).should("exist");
      cy.contains(independentText).should("not.exist");
    });

    it("should change image in original todo and propagate to repeated todos", () => {
      const todoText = "Todo with image to propagate";

      cy.createTodoWithImage(todoText, "test-image.jpg");

      cy.repeatTodo(
        todoText,
        tomorrow.day,
        tomorrow.month,
        tomorrow.year,
        baseDate
      );

      cy.navigateToDate(today.day, today.month, today.year);

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .should("exist")
        .invoke("attr", "data-image-url")
        .then((originalUrl) => {
          // cy.log("Original image URL:", originalUrl);
          cy.wrap(originalUrl).as("originalImageUrl");
        });

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('input[id="edit-image"]').click();

      cy.wait(100);

      cy.get('input[type="file"]').selectFile(
        "cypress/fixtures/test-image-update.jpg",
        { force: true }
      );

      cy.get('[data-testid="image-preview"]')
        .scrollIntoView()
        .should("exist")
        .and("be.visible");

      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });

      cy.wait(1000);

      cy.get("@originalImageUrl").then((originalImageUrl) => {
        cy.contains(todoText)
          .closest('div[class*="todo-item-card"]')
          .find('[data-testid="todo-item-has-image"]')
          .should("have.attr", "data-image-url")
          .and("not.equal", originalImageUrl);
      });

      cy.navigateToDate(tomorrow.day, tomorrow.month, tomorrow.year);

      cy.get("@originalImageUrl").then((originalImageUrl) => {
        cy.contains(todoText)
          .closest('div[class*="todo-item-card"]')
          .find('[data-testid="todo-item-has-image"]')
          .should("have.attr", "data-image-url")
          .and("not.equal", originalImageUrl);
      });
    });

    it("should delete image from original todo and remove from repeated todos", () => {
      const todoText = "Todo with image to delete";

      cy.createTodoWithImage(todoText, "test-image.jpg");

      cy.repeatTodo(
        todoText,
        tomorrow.day,
        tomorrow.month,
        tomorrow.year,
        baseDate
      );

      cy.navigateToDate(today.day, today.month, today.year);

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('input[id="delete-image"]').click();

      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .should("not.exist");

      cy.navigateToDate(today.day, today.month, today.year);

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .should("not.exist");
    });
  });
});
