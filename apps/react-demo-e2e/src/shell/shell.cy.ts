import { addProduct } from '../cart/cart.po';
import { addTodo } from '../todos/todos.po';
import { goTo } from './shell.po';

// Routing is the thing that genuinely needs a browser: real URLs, real mounts
// and unmounts, real back/forward.
describe('shell and routing', () => {
  beforeEach(() => cy.visit('/'));

  it('renders the home page by default', () => {
    cy.byTestId('hero').should('contain.text', 'State management that');
    cy.byTestId('card-counter').should('be.visible');
    cy.byTestId('card-live').should('be.visible');
  });

  it('navigates between routes, updating the URL and the active link', () => {
    goTo('counter');
    cy.location('pathname').should('eq', '/counter');
    cy.byTestId('nav-counter').should('have.class', 'active');

    goTo('todos');
    cy.location('pathname').should('eq', '/todos');
    cy.byTestId('nav-todos').should('have.class', 'active');
    cy.byTestId('nav-counter').should('not.have.class', 'active');

    goTo('cart');
    cy.location('pathname').should('eq', '/cart');
    cy.contains('h1', 'Cart').should('be.visible');
  });

  it('navigates via the home cards', () => {
    cy.byTestId('card-cart').click();
    cy.location('pathname').should('eq', '/cart');
  });

  it('restores the route on back and forward', () => {
    goTo('todos');
    goTo('cart');

    cy.go('back');
    cy.location('pathname').should('eq', '/todos');
    cy.contains('h1', 'Todos').should('be.visible');

    cy.go('forward');
    cy.location('pathname').should('eq', '/cart');
    cy.contains('h1', 'Cart').should('be.visible');
  });

  it('supports deep links straight into a route', () => {
    cy.visit('/todos');
    cy.contains('h1', 'Todos').should('be.visible');
    cy.byTestId('todo-list').should('be.visible');
  });

  it('shows a not-found page for unknown routes', () => {
    cy.visit('/does-not-exist');
    cy.byTestId('not-found').should('be.visible');
  });

  it('keeps shell-held store state across navigation', () => {
    goTo('cart');
    addProduct(2, 3);
    cy.byTestId('qty-2').should('have.text', '3');

    goTo('todos');
    addTodo('Survive a route change');

    goTo('cart');
    cy.byTestId('qty-2').should('have.text', '3');

    goTo('todos');
    cy.contains('[data-testid="todo-item"]', 'Survive a route change').should('exist');
  });

  it('drives the nav badges from store selectors', () => {
    cy.byTestId('nav-todos-badge').should('have.text', '2');
    cy.byTestId('nav-cart-badge').should('not.exist');

    goTo('cart');
    addProduct(1, 2);
    cy.byTestId('nav-cart-badge').should('have.text', '2');
  });
});
