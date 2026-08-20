import { TestBed } from '@angular/core/testing';

import { byTestId, click, text, typeIn } from '../test-utils';
import { CartPageComponent } from './cart.page';

// Prices: 1 Pineapple $3.49, 2 Bananas $1.29, 3 Green Apple $0.89, 4 Peach $1.99
const renderPage = () => {
  TestBed.configureTestingModule({
    imports: [CartPageComponent],
  });
  const fixture = TestBed.createComponent(CartPageComponent);
  fixture.detectChanges();
  return fixture;
};

const add = (fixture: ReturnType<typeof renderPage>, id: number, times = 1) => {
  for (let i = 0; i < times; i++) click(fixture, `add-${id}`);
};

const coupon = (fixture: ReturnType<typeof renderPage>, code: string) =>
  typeIn(fixture, 'coupon-input', code);

describe('CartPage', () => {
  it('starts empty with zeroed totals', () => {
    const fixture = renderPage();

    expect(byTestId(fixture, 'cart-empty')).toBeTruthy();
    expect(text(fixture, 'cart-count')).toBe('0');
    expect(text(fixture, 'cart-total')).toBe('$0.00');
  });

  it('adds a product and derives its line total', () => {
    const fixture = renderPage();
    add(fixture, 1);

    expect(text(fixture, 'qty-1')).toBe('1');
    expect(text(fixture, 'line-total-1')).toBe('$3.49');
    expect(text(fixture, 'cart-subtotal')).toBe('$3.49');
  });

  it('accumulates quantities and sums across products', () => {
    const fixture = renderPage();
    add(fixture, 1, 2);
    add(fixture, 3);

    // 349 * 2 + 89 = 787
    expect(text(fixture, 'qty-1')).toBe('2');
    expect(text(fixture, 'cart-count')).toBe('3');
    expect(text(fixture, 'cart-subtotal')).toBe('$7.87');
  });

  it('increases and decreases a line', () => {
    const fixture = renderPage();
    add(fixture, 4);

    click(fixture, 'increase-4');
    expect(text(fixture, 'qty-4')).toBe('2');

    click(fixture, 'decrease-4');
    expect(text(fixture, 'qty-4')).toBe('1');
  });

  it('drops the line when the last item is decreased away', () => {
    const fixture = renderPage();
    add(fixture, 4);

    click(fixture, 'decrease-4');

    expect(byTestId(fixture, 'cart-line-4')).toBeNull();
    expect(byTestId(fixture, 'cart-empty')).toBeTruthy();
  });

  it('removes a whole line, leaving the others', () => {
    const fixture = renderPage();
    add(fixture, 1, 3);
    add(fixture, 2);

    click(fixture, 'remove-1');

    expect(byTestId(fixture, 'cart-line-1')).toBeNull();
    expect(byTestId(fixture, 'cart-line-2')).toBeTruthy();
    expect(text(fixture, 'cart-subtotal')).toBe('$1.29');
  });

  // The discount and total come from `joinStores` over the cart and coupon
  // stores, so these assertions cover state derived across two stores.
  it('applies a valid coupon to the total', () => {
    const fixture = renderPage();
    add(fixture, 1, 2); // 698

    coupon(fixture, 'ADAPT10');

    expect(byTestId(fixture, 'coupon-valid')).toBeTruthy();
    expect(text(fixture, 'cart-discount')).toBe('−$0.70');
    expect(text(fixture, 'cart-total')).toBe('$6.28');
  });

  it('accepts a coupon typed in lower case', () => {
    const fixture = renderPage();
    add(fixture, 1, 2);

    coupon(fixture, 'state25');

    expect(text(fixture, 'cart-discount')).toBe('−$1.75');
    expect(text(fixture, 'cart-total')).toBe('$5.23');
  });

  it('rejects an unknown coupon and charges full price', () => {
    const fixture = renderPage();
    add(fixture, 3);

    coupon(fixture, 'NOPE');

    expect(byTestId(fixture, 'coupon-invalid')).toBeTruthy();
    expect(text(fixture, 'cart-discount')).toBe('−$0.00');
    expect(text(fixture, 'cart-total')).toBe('$0.89');
  });

  it('recomputes the total when the cart changes under a coupon', () => {
    const fixture = renderPage();
    coupon(fixture, 'STATE25');
    add(fixture, 4, 2); // 398 -> discount 100, total 298

    expect(text(fixture, 'cart-total')).toBe('$2.98');

    click(fixture, 'increase-4'); // 597 -> 149, total 448
    expect(text(fixture, 'cart-discount')).toBe('−$1.49');
    expect(text(fixture, 'cart-total')).toBe('$4.48');
  });

  it('clears the discount when the coupon is removed', () => {
    const fixture = renderPage();
    add(fixture, 1);
    coupon(fixture, 'ADAPT10');
    expect(text(fixture, 'cart-total')).toBe('$3.14');

    coupon(fixture, '');

    expect(byTestId(fixture, 'coupon-valid')).toBeNull();
    expect(byTestId(fixture, 'coupon-invalid')).toBeNull();
    expect(text(fixture, 'cart-total')).toBe('$3.49');
  });
});
