import { addProduct, applyCoupon, increase } from './cart.po';

// Rounding, lower-case codes, invalid codes and line removal are covered by the
// adapter and component unit tests. This is the main journey.
describe('cart', () => {
  beforeEach(() => cy.visit('/cart'));

  it('starts empty', () => {
    cy.byTestId('cart-empty').should('be.visible');
    cy.byTestId('cart-total').should('have.text', '$0.00');
  });

  it('walks the main journey: add, adjust, discount, total', () => {
    addProduct(1); // Pineapple $3.49
    cy.byTestId('qty-1').should('have.text', '1');

    increase(1); // $6.98
    cy.byTestId('qty-1').should('have.text', '2');
    cy.byTestId('cart-subtotal').should('have.text', '$6.98');

    applyCoupon('ADAPT10');

    cy.byTestId('coupon-valid').should('be.visible');
    cy.byTestId('cart-discount').should('have.text', '−$0.70');
    cy.byTestId('cart-total').should('have.text', '$6.28');
  });
});
