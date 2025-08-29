describe("Coop Todos()", () => {
  before(() => {
    cy.task("db:reset");
    cy.createTestUser();

    // Create a second test user for testing invitations (simplified - just in db_users)
    cy.task("supabaseInsert", {
      table: "db_users",
      values: {
        id: "180c1d79-2736-4019-8dad-e9a2ed958531",
        email: "taskertestuser2@developedbybart.pl",
      },
    }).then((result) => {
      cy.log("Second user creation result:", result);
    });
  });

  beforeEach(() => {
    cy.setupTestSession();
    cy.cleanupTodosOnly();
    cy.visit("/");
  });

  describe("Coop Todos -> Tables and invitations actions", () => {
    it("should successfully create a table", () => {
      cy.get('[data-testid="coop-todos-trigger"]').first().click();
      cy.get('[data-testid="create-table-button"]').click();
      cy.get('[data-testid="create-table-name-input"]').type("Test Table");
      cy.get('[data-testid="create-table-submit-button"]').click();
      cy.get('[data-testid="toaster"]').find("button").click({ force: true });
      cy.get('div[role="dialog"]').type("{esc}");
      cy.contains("Test Table").should("exist");
    });

    it("should successfully edit a table", () => {
      cy.get('[data-testid="coop-todos-trigger"]').first().click();
      cy.get('[data-testid="create-table-button"]').click();
      cy.get('[data-testid="create-table-name-input"]').type("Test Table");
      cy.get('[data-testid="create-table-submit-button"]').click();
      cy.get("body").click(0, 0, { force: true });
      cy.get('[data-testid="coop-table-edit-button-icon"]').click();

      cy.get('[data-testid="edit-table-name-input"]').should(
        "have.value",
        "Test Table"
      );
      cy.get('[data-testid="edit-table-name-input"]').type(
        "{selectall}{del}Test Table Edited"
      );
      cy.get('[data-testid="edit-table-submit-button"]').click();
      cy.contains("Test Table Edited").should("exist");
    });

    it("should successfully delete a table", () => {
      cy.get('[data-testid="coop-todos-trigger"]').first().click();
      cy.get('[data-testid="create-table-button"]').click();
      cy.get('[data-testid="create-table-name-input"]').type("Test Table");
      cy.get('[data-testid="create-table-submit-button"]').click();
      cy.get("body").click(0, 0, { force: true });

      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(true);
      });
      cy.get('[data-testid="coop-table-delete-button-icon"]').click();
      cy.contains("Test Table").should("not.exist");
    });

    it("should cancel deletion when user cancels confirmation", () => {
      cy.get('[data-testid="coop-todos-trigger"]').first().click();
      cy.get('[data-testid="create-table-button"]').click();
      cy.get('[data-testid="create-table-name-input"]').type(
        "Test Table to Keep"
      );
      cy.get('[data-testid="create-table-submit-button"]').click();
      cy.get("body").click(0, 0, { force: true });
      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(false);
      });
      cy.get('[data-testid="coop-table-delete-button-icon"]').click();
      cy.contains("Test Table to Keep").should("exist");
    });

    it("should successfully invite users to a table", () => {
      cy.get('[data-testid="coop-todos-trigger"]').first().click();
      cy.get('[data-testid="create-table-button"]').click();
      cy.get('[data-testid="create-table-name-input"]').type(
        "Test Table for Invitation"
      );
      cy.get('[data-testid="create-table-submit-button"]').click();
      cy.get("body").click(0, 0, { force: true });
      // Now invite a user
      cy.get('[data-testid="coop-table-invite-button-icon"]').first().click();
      cy.get('input[name="email"]')
        .first()
        .type("taskertestuser2@developedbybart.pl");
      cy.get("button").contains("Send invitations").click();
      cy.get('[data-testid="coop-todos-invitations-tab"]').click();
      cy.get('[data-testid="coop-todos-sent-tab"]').click({ force: true });
      cy.contains("taskertestuser2@developedbybart.pl").should("exist");
    });

    it("should show error when user doesnt exist when sending invitations", () => {
      cy.get('[data-testid="coop-todos-trigger"]').first().click();
      cy.get('[data-testid="create-table-button"]').click();
      cy.get('[data-testid="create-table-name-input"]').type(
        "Test Table for Invitation"
      );
      cy.get('[data-testid="create-table-submit-button"]').click();
      cy.get("body").click(0, 0, { force: true });
      cy.get('[data-testid="coop-table-invite-button-icon"]').first().click();
      cy.get('input[name="email"]')
        .first()
        .type("nonexistentuser@developedbybart.pl");
      cy.get("button").contains("Send invitations").click();
      cy.get('[data-testid="toaster"]')
        .contains("Action failed. Please try again.")
        .should("exist");
    });

    it("should visible table in member role", () => {
      cy.task("createSharedTable", {
        tableName: "Shared Test Table",
        description: "Table for testing invitation acceptance",
        ownerUserId: "180c1d79-2736-4019-8dad-e9a2ed958531",
        ownerEmail: "taskertestuser2@developedbybart.pl",
        memberEmails: ["taskertestuser@developedbybart.pl"],
      }).then(() => {
        cy.get('[data-testid="coop-todos-trigger"]').first().click();

        cy.contains("Shared Test Table").should("exist");
      });
    });

    it("should can leave table when role is member", () => {
      cy.task("createSharedTable", {
        tableName: "Shared Test Table",
        description: "Table for testing invitation acceptance",
        ownerUserId: "180c1d79-2736-4019-8dad-e9a2ed958531",
        ownerEmail: "taskertestuser2@developedbybart.pl",
        memberEmails: ["taskertestuser@developedbybart.pl"],
      }).then(() => {
        cy.get('[data-testid="coop-todos-trigger"]').first().click();

        cy.contains("Shared Test Table").should("exist");

        cy.contains("Shared Test Table").should("exist");
        cy.contains("button", "Accept").click();

        cy.window().then((win) => {
          cy.stub(win, "confirm").returns(true);
        });
        cy.get('[data-testid="coop-table-leave-button"]').click();
        cy.contains("Shared Test Table").should("not.exist");
      });
    });

    it("should have table in received tab when user is invited with pending status", () => {
      cy.task("createSharedTable", {
        tableName: "Shared Test Table",
        description: "Table for testing invitation acceptance",
        ownerUserId: "180c1d79-2736-4019-8dad-e9a2ed958531",
        ownerEmail: "taskertestuser2@developedbybart.pl",
        memberEmails: ["taskertestuser@developedbybart.pl"],
      }).then(() => {
        cy.get('[data-testid="coop-todos-trigger"]').first().click();

        cy.get('[data-testid="coop-todos-invitations-tab"]').click();
        cy.get('[data-testid="coop-todos-received-tab"]').click();

        cy.contains("Shared Test Table").should("exist");
      });
    });

    it("should show table in sent tab when user creates table with invitations", () => {
      cy.task("getUserIdByEmail", "taskertestuser@developedbybart.pl").then(
        (userId) => {
          cy.task("createSharedTable", {
            tableName: "My Shared Table",
            description: "Table where I invite others",
            ownerUserId: userId,
            ownerEmail: "taskertestuser@developedbybart.pl",
            memberEmails: ["taskertestuser2@developedbybart.pl"],
          }).then(() => {
            cy.get('[data-testid="coop-todos-trigger"]').first().click();

            cy.get('[data-testid="coop-todos-invitations-tab"]').click();
            cy.get('[data-testid="coop-todos-sent-tab"]').click();

            cy.contains("My Shared Table").should("exist");
          });
        }
      );
    });

    it("should show pending invitation with accept/decline buttons", () => {
      cy.task("createSharedTable", {
        tableName: "Pending Invitation Table",
        description: "Table for testing pending invitations with actions",
        ownerUserId: "180c1d79-2736-4019-8dad-e9a2ed958531",
        ownerEmail: "taskertestuser2@developedbybart.pl",
        memberEmails: ["taskertestuser@developedbybart.pl"],
      }).then(() => {
        cy.get('[data-testid="coop-todos-trigger"]').first().click();

        cy.get('[data-testid="coop-todos-invitations-tab"]').click();
        cy.get('[data-testid="coop-todos-pending-tab"]').click();

        cy.contains("Pending Invitation Table").should("exist");
        cy.contains("button", "Accept").should("exist");
        cy.contains("button", "Decline").should("exist");
      });
    });

    it("should accept invitation and update status", () => {
      cy.task("createSharedTable", {
        tableName: "Accept Test Table",
        description: "Table for testing invitation acceptance",
        ownerUserId: "180c1d79-2736-4019-8dad-e9a2ed958531",
        ownerEmail: "taskertestuser2@developedbybart.pl",
        memberEmails: ["taskertestuser@developedbybart.pl"],
      }).then(() => {
        cy.get('[data-testid="coop-todos-trigger"]').first().click();

        cy.get('[data-testid="coop-todos-invitations-tab"]').click();
        cy.get('[data-testid="coop-todos-pending-tab"]').click();

        cy.contains("Accept Test Table").should("exist");
        cy.contains("button", "Accept").click();

        cy.contains("Accept Test Table").should("exist");
      });
    });
  });

  describe("Coop Todos -> inside table todos actions", () => {
    it("should successfully create a todo", () => {
      cy.get('[data-testid="coop-todos-trigger"]').first().click();
      cy.get('[data-testid="create-table-button"]').click();
      cy.get('[data-testid="create-table-name-input"]').type("Test Table");
      cy.get('[data-testid="create-table-submit-button"]').click();
      cy.get("body").click(0, 0, { force: true });

      cy.get('[data-testid="coop-table-name"]').click();
      cy.get('[data-testid="in-table-coop-add-new-todo-button"]').click();
      cy.get('[data-testid="add-coop-todo-button"]').click();
      cy.get('[data-testid="add-coop-todo-input"]').type("Test Todo");
      cy.get('[data-testid="add-coop-todo-button"]').click();
      cy.contains("Test Todo").should("exist");
    });

    it("should successfully edit a todo", () => {
      const todoText = "Test Todo";

      cy.get('[data-testid="coop-todos-trigger"]').first().click();
      cy.get('[data-testid="create-table-button"]').click();
      cy.get('[data-testid="create-table-name-input"]').type("Test Table");
      cy.get('[data-testid="create-table-submit-button"]').click();
      cy.get("body").click(0, 0, { force: true });

      cy.get('[data-testid="coop-table-name"]').click();
      cy.get('[data-testid="in-table-coop-add-new-todo-button"]').click();
      cy.get('[data-testid="add-coop-todo-input"]').type(todoText);
      cy.get('[data-testid="add-coop-todo-button"]').click();
      cy.contains(todoText).should("exist");

      cy.contains(todoText)
        .closest('div[class*="coop-todo-item-card"]')
        .find('[data-testid="in-table-coop-todo-dropdown-menu-trigger"]')
        .click();

      cy.get('[data-testid="in-table-coop-todo-edit-button-icon"]').click();
      cy.get('[data-testid="edit-coop-todo-input"]').type(
        "{selectall}{del}Test Todo Edited"
      );
      cy.get('[data-testid="edit-coop-todo-button"]').click();
      cy.contains("Test Todo Edited").should("exist");
    });

    it("should successfully delete a todo", () => {
      const todoText = "Test Todo";

      cy.get('[data-testid="coop-todos-trigger"]').first().click();
      cy.get('[data-testid="create-table-button"]').click();
      cy.get('[data-testid="create-table-name-input"]').type("Test Table");
      cy.get('[data-testid="create-table-submit-button"]').click();
      cy.get("body").click(0, 0, { force: true });

      cy.get('[data-testid="coop-table-name"]').click();
      cy.get('[data-testid="in-table-coop-add-new-todo-button"]').click();
      cy.get('[data-testid="add-coop-todo-input"]').type(todoText);
      cy.get('[data-testid="add-coop-todo-button"]').click();
      cy.contains(todoText).should("exist");

      cy.contains(todoText)
        .closest('div[class*="coop-todo-item-card"]')
        .find('[data-testid="in-table-coop-todo-dropdown-menu-trigger"]')
        .click();

      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(true);
      });
      cy.get('[data-testid="in-table-coop-todo-delete-button-icon"]').click();
      cy.contains(todoText).should("not.exist");
    });

    it("should successfully complete a todo", () => {
      const todoText = "Test Todo";

      cy.get('[data-testid="coop-todos-trigger"]').first().click();
      cy.get('[data-testid="create-table-button"]').click();
      cy.get('[data-testid="create-table-name-input"]').type("Test Table");
      cy.get('[data-testid="create-table-submit-button"]').click();
      cy.get("body").click(0, 0, { force: true });

      cy.get('[data-testid="coop-table-name"]').click();
      cy.get('[data-testid="in-table-coop-add-new-todo-button"]').click();
      cy.get('[data-testid="add-coop-todo-input"]').type(todoText);
      cy.get('[data-testid="add-coop-todo-button"]').click();
      cy.contains(todoText).should("exist");

      cy.get('[data-testid="in-table-coop-todo-complete-button"]').click();
      cy.contains(todoText)
        .closest('div[class*="coop-todo-item-card"]')
        .should("have.class", "bg-green-50");
    });
  });
});
