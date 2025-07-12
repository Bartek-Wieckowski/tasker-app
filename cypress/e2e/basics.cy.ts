/// <reference types="Cypress" />

const loginPage = 'http://localhost:5173/login';

describe('login page', () => {
  it('should have a title', () => {
    cy.visit(loginPage);
    cy.get('a[href="/"]').should('have.length', 1);
    cy.get('a[href="/"]').contains('tasker');
  });
  it('main navbar should have a button with register text', () => {
    cy.visit(loginPage);
    cy.get('a[href="/register"]').eq(0).should('have.text', 'Register');
  });
  it('should have a button to login with google provider with google icon/img', () => {
    cy.visit(loginPage);
    cy.get('button').contains('Login with').siblings('img');
  });
  it('should redirect to /register when clicking on register button', () => {
    cy.visit(loginPage);
    cy.get('a[href="/register"]').eq(0).click();
    cy.url().should('eq', 'http://localhost:5173/register');
  });
  // it("should open google modal provider login when clicking on login with google button", () => {
  //   cy.visit(loginPage);
  //   cy.get('button').contains('Login with').siblings('img').click();

  //   cy.get('input[type="email"]').should('exist');
  // });
});
