/** Both counters share one adapter, so the page object covers both. */
export const counter = (which: 'a' | 'b') => ({
  value: () => cy.byTestId(`counter-${which}-value`),
  parity: () => cy.byTestId(`counter-${which}-parity`),
  increment: () => cy.byTestId(`counter-${which}-increment`).click(),
  decrement: () => cy.byTestId(`counter-${which}-decrement`).click(),
  double: () => cy.byTestId(`counter-${which}-double`).click(),
  negate: () => cy.byTestId(`counter-${which}-negate`).click(),
  reset: () => cy.byTestId(`counter-${which}-reset`).click(),
});

export const setStep = (step: string) => {
  cy.byTestId('step-input').clear();
  cy.byTestId('step-input').type(step);
};

export const getSum = () => cy.byTestId('counter-sum');
export const resetAll = () => cy.byTestId('reset-all').click();
