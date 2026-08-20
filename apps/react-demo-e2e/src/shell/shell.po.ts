export type Section = 'home' | 'counter' | 'todos' | 'cart' | 'crew' | 'live';

export const getNav = () => cy.get('.nav');

export const goTo = (section: Section) => cy.byTestId(`nav-${section}`).click();

export const getCartBadge = () => cy.byTestId('nav-cart-badge');
export const getTodosBadge = () => cy.byTestId('nav-todos-badge');
