/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      /**
       * Select an element by its `data-testid`, keeping the specs free of
       * styling- and copy-dependent selectors.
       *
       * @example cy.byTestId('cart-total').should('have.text', '$6.28')
       */
      byTestId(
        testId: string,
        options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable>,
      ): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('byTestId', (testId: string, options?) =>
  cy.get(`[data-testid="${testId}"]`, options),
);

export {};
