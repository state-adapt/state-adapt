import { counter, getSum, resetAll, setStep } from './counter.po';

const a = counter('a');
const b = counter('b');

// Every reaction and selector variation is covered by the adapter unit tests.
// What is worth doing for real here is the shared source driving two stores.
describe('counter', () => {
  beforeEach(() => cy.visit('/counter'));

  it('starts both counters at their initial state', () => {
    a.value().should('have.text', '0');
    b.value().should('have.text', '10');
    getSum().should('have.text', '10');
  });

  it('drives two independent stores from one adapter', () => {
    setStep('5');

    a.increment();
    a.value().should('have.text', '5');
    b.value().should('have.text', '10');

    b.double();
    b.value().should('have.text', '20');
    getSum().should('have.text', '25');
  });

  it('resets both stores from one shared source', () => {
    a.increment();
    b.increment();
    a.value().should('have.text', '1');
    b.value().should('have.text', '11');

    resetAll();

    a.value().should('have.text', '0');
    b.value().should('have.text', '10');
  });
});
