export const getTicker = () => cy.byTestId('ticker');
export const getStatus = () => cy.byTestId('ticker-status');
export const getTeardowns = () => cy.byTestId('ticker-teardowns');
export const getActivations = () => cy.byTestId('ticker-activations');

/** The interval runs at 500ms, so counts need a generous window. */
export const getCount = (timeout = 8000) => cy.byTestId('ticker-count', { timeout });

export const readCount = (then: (count: number) => void) =>
  cy
    .byTestId('ticker-count')
    .invoke('text')
    .then(text => then(Number(text)));

export const setKeepAlive = (on: boolean) =>
  on ? cy.byTestId('keep-alive').check() : cy.byTestId('keep-alive').uncheck();
