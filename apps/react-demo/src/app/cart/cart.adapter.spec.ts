import {
  CartState,
  cartAdapter,
  couponAdapter,
  formatPrice,
  products,
} from './cart.adapter';

// 1 Pineapple 349, 2 Bananas 129, 3 Green Apple 89, 4 Peach 199
const select = <K extends keyof typeof cartAdapter.selectors>(name: K, s: CartState) =>
  (cartAdapter.selectors[name] as any)(s);

const couponSelect = <K extends keyof typeof couponAdapter.selectors>(
  name: K,
  s: string,
) => (couponAdapter.selectors[name] as any)(s);

describe('formatPrice', () => {
  it('renders cents as dollars', () => {
    expect(formatPrice(0)).toBe('$0.00');
    expect(formatPrice(89)).toBe('$0.89');
    expect(formatPrice(1234)).toBe('$12.34');
  });
});

describe('cartAdapter reactions', () => {
  it('adds a product not yet in the cart', () => {
    expect(cartAdapter.add({}, 1, {})).toEqual({ 1: 1 });
  });

  it('increments a product already in the cart', () => {
    expect(cartAdapter.add({ 1: 2 }, 1, {})).toEqual({ 1: 3 });
  });

  it('keeps other products untouched when adding', () => {
    expect(cartAdapter.add({ 1: 1, 2: 5 }, 1, {})).toEqual({ 1: 2, 2: 5 });
  });

  it('decrements with removeOne', () => {
    expect(cartAdapter.removeOne({ 1: 3 }, 1, {})).toEqual({ 1: 2 });
  });

  it('drops the line when the last item is removed', () => {
    expect(cartAdapter.removeOne({ 1: 1, 2: 1 }, 1, {})).toEqual({ 2: 1 });
  });

  it('is a no-op removing a product that is not there', () => {
    expect(cartAdapter.removeOne({ 2: 1 }, 1, {})).toEqual({ 2: 1 });
  });

  it('removes a whole line at once', () => {
    expect(cartAdapter.removeAll({ 1: 7, 2: 1 }, 1, {})).toEqual({ 2: 1 });
  });

  it('sets an explicit quantity', () => {
    expect(cartAdapter.setQuantity({ 1: 1 }, { id: 1, quantity: 4 }, {})).toEqual({
      1: 4,
    });
  });

  it('treats a non-positive quantity as removal', () => {
    expect(cartAdapter.setQuantity({ 1: 3 }, { id: 1, quantity: 0 }, {})).toEqual({});
    expect(cartAdapter.setQuantity({ 1: 3 }, { id: 1, quantity: -2 }, {})).toEqual({});
  });
});

describe('cartAdapter selectors', () => {
  it('reports an empty cart', () => {
    expect(select('isEmpty', {})).toBe(true);
    expect(select('itemCount', {})).toBe(0);
    expect(select('subtotal', {})).toBe(0);
  });

  it('builds lines in product order', () => {
    const lines = select('lines', { 4: 1, 1: 2 });

    expect(lines.map((line: any) => line.product.id)).toEqual([1, 4]);
    expect(lines[0].quantity).toBe(2);
  });

  it('ignores ids with no matching product', () => {
    expect(select('lines', { 999: 3 })).toHaveLength(0);
  });

  it('counts every item, not every line', () => {
    expect(select('itemCount', { 1: 2, 2: 3 })).toBe(5);
  });

  it('sums the subtotal across lines', () => {
    // 349 * 2 + 89 = 787
    expect(select('subtotal', { 1: 2, 3: 1 })).toBe(787);
  });
});

describe('couponAdapter selectors', () => {
  it('normalises the code', () => {
    expect(couponSelect('code', '  adapt10 ')).toBe('ADAPT10');
  });

  it('accepts known codes in any case', () => {
    expect(couponSelect('isValid', 'ADAPT10')).toBe(true);
    expect(couponSelect('isValid', 'state25')).toBe(true);
    expect(couponSelect('discountRate', 'ADAPT10')).toBe(0.1);
    expect(couponSelect('discountRate', 'STATE25')).toBe(0.25);
  });

  it('rejects an unknown code', () => {
    expect(couponSelect('isValid', 'NOPE')).toBe(false);
    expect(couponSelect('isRejected', 'NOPE')).toBe(true);
    expect(couponSelect('discountRate', 'NOPE')).toBe(0);
  });

  it('treats an empty code as neither valid nor rejected', () => {
    expect(couponSelect('isValid', '')).toBe(false);
    expect(couponSelect('isRejected', '')).toBe(false);
    expect(couponSelect('isRejected', '   ')).toBe(false);
  });

  it('clears back to empty', () => {
    expect(couponAdapter.clear('ADAPT10', undefined as void, '')).toBe('');
  });
});

describe('products', () => {
  it('has a unique id per product', () => {
    const ids = products.map(product => product.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
