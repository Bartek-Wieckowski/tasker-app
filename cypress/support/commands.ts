/// <reference types="Cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      createTestUser(
        username?: string,
        email?: string,
        password?: string
      ): Chainable<void>;
      createTestUserInDb(userId: string): Chainable<void>;
      createTodo(todoText: string): Chainable<void>;
      createTodoWithImage(
        todoText: string,
        imageFixture: string
      ): Chainable<void>;
      moveTodoToDate(
        todoText: string,
        targetDay: number,
        targetMonth: number,
        targetYear: number
      ): Chainable<void>;
      navigateToDate(
        targetDay: number,
        targetMonth: number,
        targetYear: number
      ): Chainable<void>;
      repeatTodo(
        todoText: string,
        targetDay: number,
        targetMonth: number,
        targetYear: number,
        currentDate: Date
      ): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  "createTestUser",
  (
    username = "taskerTestUser",
    email = "taskertestuser@developedbybart.pl",
    password = "password123"
  ) => {
    cy.visit("/register");
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // After successful registration, get the user ID and add to db_users table
    cy.window().then(() => {
      // Wait a bit for the auth context to be available
      cy.wait(1000);

      // Try to get user ID from localStorage or sessionStorage
      cy.window().then((win) => {
        const authData =
          win.localStorage.getItem("sb-auth-token") ||
          win.sessionStorage.getItem("sb-auth-token");

        if (authData) {
          try {
            const parsed = JSON.parse(authData);
            const userId = parsed?.user?.id;

            if (userId) {
              // Add user to db_users table
              cy.createTestUserInDb(userId);
            }
          } catch (e) {
            console.log("Could not parse auth data:", e);
          }
        }
      });
    });
  }
);

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("eq", Cypress.config().baseUrl + "/");
});

Cypress.Commands.add("logout", () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should("eq", Cypress.config().baseUrl + "/login");
});

Cypress.Commands.add("createTestUserInDb", (userId: string) => {
  cy.task("supabaseInsert", {
    table: "db_users",
    values: {
      id: userId,
      username: "taskerTestUser",
      email: "taskertestuser@developedbybart.pl",
    },
  });
});

// commands to todo
Cypress.Commands.add("createTodo", (todoText) => {
  cy.get('[data-testid="add-todo-button"]').click();
  cy.get('input[name*="todo"]').first().type(todoText);
  cy.get('button[type="submit"]').click();
  cy.contains(todoText).should("exist");
});

Cypress.Commands.add("createTodoWithImage", (todoText, imageFixture) => {
  cy.get('[data-testid="add-todo-button"]').click();
  cy.get('input[name*="todo"]').first().type(todoText);

  cy.get('[id="todoPhoto"]').click();
  cy.get('input[type="file"]').selectFile(`cypress/fixtures/${imageFixture}`, {
    force: true,
  });

  cy.get('[data-testid="image-preview"]', { timeout: 10000 }).should(
    "be.visible"
  );

  cy.get('button[type="submit"]').click();
  cy.contains(todoText).should("exist");
});

Cypress.Commands.add(
  "moveTodoToDate",
  (todoText, targetDay, targetMonth, targetYear) => {
    const currentDate = new Date();

    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="popover-trigger"]')
      .click();

    cy.contains("button", /move/i).click();

    if (
      targetMonth > currentDate.getMonth() + 1 ||
      targetYear > currentDate.getFullYear()
    ) {
      cy.get('[role="button"][name="next-month"]').click();
    }

    cy.get(`[role="gridcell"]`).contains(targetDay).click();

    cy.get('[data-testid="move-todo-button"]').click();
  }
);

Cypress.Commands.add("navigateToDate", (targetDay, targetMonth, targetYear) => {
  const currentDate = new Date();

  cy.get('[data-testid="date-picker-button"]').click();

  if (
    targetMonth > currentDate.getMonth() + 1 ||
    targetYear > currentDate.getFullYear()
  ) {
    cy.get('[role="button"][name="next-month"]').click();
  }

  cy.get(`[role="gridcell"]`).contains(targetDay).click({ force: true });
});

Cypress.Commands.add(
  "repeatTodo",
  (todoText, targetDay, targetMonth, targetYear, currentDate) => {
    cy.contains(todoText)
      .closest('div[class*="todo-item-card"]')
      .find('[data-testid="popover-trigger"]')
      .click();

    cy.contains("button", /repeat/i).click();

    if (
      targetMonth > currentDate.getMonth() + 1 ||
      targetYear > currentDate.getFullYear()
    ) {
      cy.get('[role="button"][name="next-month"]').click();
    }

    cy.get(`[role="gridcell"]`).contains(targetDay).click();

    cy.get('[data-testid="repeat-todo-button"]').click();
  }
);

export {};
