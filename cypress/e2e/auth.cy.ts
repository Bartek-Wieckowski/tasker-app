/// <reference types="Cypress" />

describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.task("db:reset");
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  afterEach(() => {
    cy.task("db:reset");
  });

  describe("Registration", () => {
    it("should allow user to register with valid credentials", () => {
      cy.createTestUser();
      cy.get('[data-testid="user-avatar"]').should("exist");
    });

    // it("should show error for invalid email format", () => {
    //   cy.visit("/register");

    //   cy.get('input[name="username"]').type("testuser");
    //   cy.get('input[name="email"]').type("invalid-email");
    //   cy.get('input[name="password"]').type("password123");
    //   cy.get('button[type="submit"]').click();

    //   cy.get('[data-testid="error-message"]').should(
    //     "contain",
    //     "Invalid email"
    //   );
    // });

    // it("should show error for weak password", () => {
    //   cy.visit("/register");

    //   cy.get('input[name="username"]').type("testuser");
    //   cy.get('input[name="email"]').type("test@example.com");
    //   cy.get('input[name="password"]').type("123");
    //   cy.get('button[type="submit"]').click();

    //   cy.get('[data-testid="error-message"]').should(
    //     "contain",
    //     "Password too weak"
    //   );
    // });
  });

  // describe("Login", () => {
  //   it("should allow user to login with valid credentials", () => {
  //     cy.createTestUser();

  //     cy.logout();

  //     cy.login("taskerTestUser@developedbybart.pl", "password123");
  //     cy.get('[data-testid="user-menu"]').should("exist");
  //   });

  //   it("should show error for invalid credentials", () => {
  //     cy.visit("/login");

  //     cy.get('input[name="email"]').type("taskerTestUser@developedbybart.pl");
  //     cy.get('input[name="password"]').type("wrongpassword");
  //     cy.get('button[type="submit"]').click();

  //     cy.get('[data-testid="error-message"]').should(
  //       "contain",
  //       "Invalid credentials"
  //     );
  //   });

  //   it("should redirect to login when accessing protected route without auth", () => {
  //     cy.visit("/todos");

  //     cy.url().should("eq", Cypress.config().baseUrl + "/login");
  //   });
  // });

  // describe("Google OAuth", () => {
  //   it("should show Google login button", () => {
  //     cy.visit("/login");

  //     cy.get("button").contains("Login with Google").should("exist");
  //     cy.get("button")
  //       .contains("Login with Google")
  //       .find("img")
  //       .should("exist");
  //   });

  //   // Note: Full OAuth testing requires special setup with test accounts
  //   // This is typically done in staging environments
  // });

  // describe("User Settings", () => {
  //   beforeEach(() => {
  //     // Register and login first
  //     cy.createTestUser();
  //   });

  //   it("should allow user to update profile information", () => {
  //     cy.visit("/settings");

  //     cy.get('input[name="username"]').clear().type("newusername");
  //     cy.get('input[name="email"]').clear().type("newemail@example.com");
  //     cy.get('button[type="submit"]').click();

  //     cy.get('[data-testid="success-message"]').should(
  //       "contain",
  //       "Settings updated"
  //     );
  //     cy.get('input[name="username"]').should("have.value", "newusername");
  //   });

  //   it("should allow user to change password", () => {
  //     cy.visit("/settings");

  //     cy.get('input[name="currentPassword"]').type("password123");
  //     cy.get('input[name="newPassword"]').type("newpassword123");
  //     cy.get('input[name="confirmPassword"]').type("newpassword123");
  //     cy.get("button").contains("Change Password").click();

  //     cy.get('[data-testid="success-message"]').should(
  //       "contain",
  //       "Password updated"
  //     );
  //   });
  // });

  // describe("Logout", () => {
  //   beforeEach(() => {
  //     // Register and login first
  //     cy.createTestUser();
  //   });

  //   it("should logout user and redirect to login page", () => {
  //     cy.get('[data-testid="user-menu"]').click();
  //     cy.get('[data-testid="logout-button"]').click();

  //     cy.url().should("eq", Cypress.config().baseUrl + "/login");
  //     cy.get('[data-testid="user-menu"]').should("not.exist");
  //   });
  // });
});
