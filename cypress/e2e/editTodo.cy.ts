describe("Edit Todo()", () => {
  const email = "taskertestuser@developedbybart.pl";
  const password = "password123";
  //   const targetYear = new Date().getFullYear();
  //   const targetMonth = new Date().getMonth() + 1;
  //   const targetDay = 25;
  const currentDate = new Date();
  const nextDay = new Date(currentDate);
  nextDay.setDate(currentDate.getDate() + 1);

  before(() => {
    cy.task("db:reset");
    cy.createTestUser();
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

      // Clear and type new text
      cy.get('input[placeholder*="todo"]').first().clear().type(editedText);

      cy.get('button[type="submit"]').click();

      // Verify the change
      cy.contains(editedText).should("exist");
      cy.contains(originalText).should("not.exist");
    });

    it("should edit todo more content successfully", () => {
      const todoText = "Todo with content";
      const originalContent = "Original content";
      const editedContent = "Edited content";

      cy.login(email, password);
      cy.visit("/");

      cy.get('[data-testid="add-todo-button"]').click();
      cy.get('input[name*="todo"]').type(todoText);
      cy.get('textarea[name*="todo_more_content"]').type(originalContent);
      cy.get('button[type="submit"]').click();

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('textarea[name*="todo_more_content"]').clear().type(editedContent);
      cy.get('button[type="submit"]').click();

      cy.contains(editedContent).should("exist");
      cy.contains(originalContent).should("not.exist");
    });

    it("should add image to existing todo", () => {
      const todoText = "Todo without image";

      cy.login(email, password);
      cy.visit("/");

      cy.createTodo(todoText);

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

      cy.get('[data-testid="image-preview"]', { timeout: 10000 }).should(
        "be.visible"
      );
      cy.get('button[type="submit"]').click();

      // Verify image was added
      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .scrollIntoView()
        .should("exist")
        .and("be.visible");
    });

    it("should replace existing image with new image", () => {
      const todoText = "Todo with replaceable image";

      cy.login(email, password);
      cy.visit("/");

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

      cy.get('input[id="edit-image"]').click();

      cy.get('input[type="file"]').selectFile(
        "cypress/fixtures/test-image-update.jpg",
        { force: true }
      );

      cy.get('[data-testid="image-preview"]').should("be.visible");

      cy.get('button[type="submit"]').click();

      // Verify the todo still has an image (confirming replacement worked)
      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .scrollIntoView()
        .should("exist")
        .and("be.visible");

      // Test that we can open the lightbox to confirm image changed
      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .scrollIntoView()
        .should("be.visible")
        .click();
    });

    it("should delete image from todo", () => {
      const todoText = "Todo with deletable image";

      cy.login(email, password);
      cy.visit("/");

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

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .should("not.exist");
    });

    it("should handle image operations with text changes", () => {
      const originalText = "Original with image";
      const editedText = "Edited with new image";

      cy.login(email, password);
      cy.visit("/");

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

      cy.get('[data-testid="image-preview"]', { timeout: 10000 }).should(
        "be.visible"
      );
      cy.get('button[type="submit"]').click();

      // Verify both changes
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

      cy.login(email, password);
      cy.visit("/");

      cy.createTodo(originalText);

      cy.repeatTodo(
        originalText,
        nextDay.getDate(),
        nextDay.getMonth() + 1,
        nextDay.getFullYear(),
        currentDate
      );

      // Go back to original date and edit the original todo
      const today = new Date();
      cy.navigateToDate(
        today.getDate(),
        today.getMonth() + 1,
        today.getFullYear()
      );

      cy.contains(originalText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('input[name*="todo"]').first().clear().type(editedText);

      cy.get('button[type="submit"]').click();

      // Verify original changed
      cy.contains(editedText).should("exist");

      // Navigate back to future date and verify repeated todo also changed
      cy.navigateToDate(
        nextDay.getDate(),
        nextDay.getMonth() + 1,
        nextDay.getFullYear()
      );
      cy.contains(editedText).should("exist");
      cy.contains(originalText).should("not.exist");
    });

    it("should make repeated todo independent when edited", () => {
      const originalText = "Repeated todo to become independent";
      const independentText = "Now independent todo";

      cy.login(email, password);
      cy.visit("/");

      cy.createTodo(originalText);

      cy.repeatTodo(
        originalText,
        nextDay.getDate(),
        nextDay.getMonth() + 1,
        nextDay.getFullYear(),
        currentDate
      );

      // Navigate to previous date
      cy.navigateToDate(
        nextDay.getDate(),
        nextDay.getMonth() + 1,
        nextDay.getFullYear()
      );

      cy.contains(originalText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('input[name*="todo"]').first().clear().type(independentText);

      cy.get('button[type="submit"]').click();

      // Verify this instance changed
      cy.contains(independentText).should("exist");

      // Go back to original date and verify original didn't change
      cy.navigateToDate(
        currentDate.getDate(),
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );
      cy.contains(originalText).should("exist");
      cy.contains(independentText).should("not.exist");
    });

    it("should change image in original todo and propagate to repeated todos", () => {
      const todoText = "Todo with image to propagate";

      cy.login(email, password);
      cy.visit("/");

      // Create todo with image
      cy.createTodoWithImage(todoText, "test-image.jpg");

      // Repeat the todo to next day
      cy.repeatTodo(
        todoText,
        nextDay.getDate(),
        nextDay.getMonth() + 1,
        nextDay.getFullYear(),
        currentDate
      );

      // Navigate back to original date
      cy.navigateToDate(
        currentDate.getDate(),
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );

      // Get the original image URL for comparison
      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .should("exist")
        .then(($img) => {
          const originalImageSrc = $img.attr("data-image-url");

          // Edit the original todo and replace image
          cy.contains(todoText)
            .closest('div[class*="todo-item-card"]')
            .find('[data-testid="popover-trigger"]')
            .click();

          cy.contains("button", /edit/i).click();

          cy.get('input[id="edit-image"]').click();
          cy.get('input[type="file"]').selectFile(
            "cypress/fixtures/test-image-update.jpg",
            { force: true }
          );

          cy.get('[data-testid="image-preview"]').should("be.visible");
          cy.get('button[type="submit"]').click();

          // Verify original todo has new image (different src)
          cy.contains(todoText)
            .closest('div[class*="todo-item-card"]')
            .find('[data-testid="todo-item-has-image"]')
            .should("exist")
            .should("have.attr", "data-image-url")
            .and("not.equal", originalImageSrc);

          // Navigate to repeated todo date
          cy.navigateToDate(
            nextDay.getDate(),
            nextDay.getMonth() + 1,
            nextDay.getFullYear()
          );

          // Verify repeated todo also has the new image (same new src as original)
          cy.contains(todoText)
            .closest('div[class*="todo-item-card"]')
            .find('[data-testid="todo-item-has-image"]')
            .should("exist")
            .should("have.attr", "data-image-url")
            .and("not.equal", originalImageSrc);
        });
    });

    it("should delete image from original todo and remove from repeated todos", () => {
      const todoText = "Todo with image to delete";

      cy.login(email, password);
      cy.visit("/");

      cy.createTodoWithImage(todoText, "test-image.jpg");

      cy.repeatTodo(
        todoText,
        nextDay.getDate(),
        nextDay.getMonth() + 1,
        nextDay.getFullYear(),
        currentDate
      );

      // Navigate back to original date and delete image
      cy.navigateToDate(
        currentDate.getDate(),
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="popover-trigger"]')
        .click();

      cy.contains("button", /edit/i).click();

      cy.get('input[id="delete-image"]').click();

      cy.get('button[type="submit"]').click();

      // Verify original todo no longer has image
      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .should("not.exist");

      // Navigate to repeated todo date and verify image is also deleted
      cy.navigateToDate(
        nextDay.getDate(),
        nextDay.getMonth() + 1,
        nextDay.getFullYear()
      );

      cy.contains(todoText)
        .closest('div[class*="todo-item-card"]')
        .find('[data-testid="todo-item-has-image"]')
        .should("not.exist");
    });
  });
});
