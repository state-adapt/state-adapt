import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CartPage } from './cart.page';

// Prices: 1 Pineapple $3.49, 2 Bananas $1.29, 3 Green Apple $0.89, 4 Peach $1.99
const renderPage = () => render(<CartPage />);

const add = (id: number, times = 1) => {
  for (let i = 0; i < times; i++) fireEvent.click(screen.getByTestId(`add-${id}`));
};

const coupon = (code: string) =>
  fireEvent.change(screen.getByTestId('coupon-input'), { target: { value: code } });

const text = (testId: string) => screen.getByTestId(testId).textContent;

describe('CartPage', () => {
  it('starts empty with zeroed totals', () => {
    renderPage();

    expect(screen.getByTestId('cart-empty')).toBeTruthy();
    expect(text('cart-count')).toBe('0');
    expect(text('cart-total')).toBe('$0.00');
  });

  it('adds a product and derives its line total', () => {
    renderPage();
    add(1);

    expect(text('qty-1')).toBe('1');
    expect(text('line-total-1')).toBe('$3.49');
    expect(text('cart-subtotal')).toBe('$3.49');
  });

  it('accumulates quantities and sums across products', () => {
    renderPage();
    add(1, 2);
    add(3);

    // 349 * 2 + 89 = 787
    expect(text('qty-1')).toBe('2');
    expect(text('cart-count')).toBe('3');
    expect(text('cart-subtotal')).toBe('$7.87');
  });

  it('increases and decreases a line', () => {
    renderPage();
    add(4);

    fireEvent.click(screen.getByTestId('increase-4'));
    expect(text('qty-4')).toBe('2');

    fireEvent.click(screen.getByTestId('decrease-4'));
    expect(text('qty-4')).toBe('1');
  });

  it('drops the line when the last item is decreased away', () => {
    renderPage();
    add(4);

    fireEvent.click(screen.getByTestId('decrease-4'));

    expect(screen.queryByTestId('cart-line-4')).toBeNull();
    expect(screen.getByTestId('cart-empty')).toBeTruthy();
  });

  it('removes a whole line, leaving the others', () => {
    renderPage();
    add(1, 3);
    add(2);

    fireEvent.click(screen.getByTestId('remove-1'));

    expect(screen.queryByTestId('cart-line-1')).toBeNull();
    expect(screen.getByTestId('cart-line-2')).toBeTruthy();
    expect(text('cart-subtotal')).toBe('$1.29');
  });

  // The shared derivations read selectors from both the cart and coupon stores,
  // so these assertions cover state derived across two stores.
  it('applies a valid coupon to the total', () => {
    renderPage();
    add(1, 2); // 698

    coupon('ADAPT10');

    expect(screen.getByTestId('coupon-valid')).toBeTruthy();
    expect(text('cart-discount')).toBe('−$0.70');
    expect(text('cart-total')).toBe('$6.28');
  });

  it('accepts a coupon typed in lower case', () => {
    renderPage();
    add(1, 2);

    coupon('state25');

    expect(text('cart-discount')).toBe('−$1.75');
    expect(text('cart-total')).toBe('$5.23');
  });

  it('rejects an unknown coupon and charges full price', () => {
    renderPage();
    add(3);

    coupon('NOPE');

    expect(screen.getByTestId('coupon-invalid')).toBeTruthy();
    expect(text('cart-discount')).toBe('−$0.00');
    expect(text('cart-total')).toBe('$0.89');
  });

  it('recomputes the total when the cart changes under a coupon', () => {
    renderPage();
    coupon('STATE25');
    add(4, 2); // 398 -> discount 100, total 298

    expect(text('cart-total')).toBe('$2.98');

    fireEvent.click(screen.getByTestId('increase-4')); // 597 -> 149, total 448
    expect(text('cart-discount')).toBe('−$1.49');
    expect(text('cart-total')).toBe('$4.48');
  });

  it('clears the discount when the coupon is removed', () => {
    renderPage();
    add(1);
    coupon('ADAPT10');
    expect(text('cart-total')).toBe('$3.14');

    coupon('');

    expect(screen.queryByTestId('coupon-valid')).toBeNull();
    expect(screen.queryByTestId('coupon-invalid')).toBeNull();
    expect(text('cart-total')).toBe('$3.49');
  });
});
