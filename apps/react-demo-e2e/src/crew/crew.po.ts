export const getCrewCards = () => cy.byTestId('crew-card');
export const filterCrew = (filter: 'all' | 'active' | 'available' | 'selected') =>
  cy.byTestId(`crew-filter-${filter}`).click();
export const selectCrew = (callSign: string) =>
  cy.byTestId(`crew-select-${callSign}`).click();
export const openCrew = (name: string) =>
  cy.contains('[data-testid="crew-card"]', name).find('.crew-card-main').click();
