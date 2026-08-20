import { filterCrew, getCrewCards, openCrew, selectCrew } from './crew.po';

describe('entity roster', () => {
  beforeEach(() => cy.visit('/crew'));

  it('smokes the generated filters and filtered bulk reaction', () => {
    getCrewCards().should('have.length', 5);
    cy.byTestId('crew-selected-count').should('have.text', '2');

    selectCrew('echo-9');
    cy.byTestId('crew-selected-count').should('have.text', '1');
    filterCrew('selected');
    getCrewCards().should('have.length', 1);

    cy.byTestId('crew-award-selected').click();
    cy.byTestId('crew-clearance-atlas-2').should('have.text', 'L5');
  });

  it('opens a detail route, updates one entity, and preserves it on return', () => {
    openCrew('Jun Park');
    cy.location('pathname').should('eq', '/crew/lumen-4');

    cy.byTestId('crew-log-mission').click();
    cy.byTestId('crew-promote').click();
    cy.byTestId('crew-status').select('active');
    cy.byTestId('crew-detail-missions').should('have.text', '13');
    cy.byTestId('crew-detail-clearance').should('have.text', 'Level 3');

    cy.contains('Back to roster').click();
    cy.byTestId('crew-active-count').should('have.text', '4');
    cy.byTestId('crew-clearance-lumen-4').should('have.text', 'L3');
  });
});
