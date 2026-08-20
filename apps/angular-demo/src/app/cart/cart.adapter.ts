import { buildAdapter } from '@state-adapt/core';

export interface Product {
  id: number;
  name: string;
  emoji: string;
  /** Price in cents, to keep the arithmetic exact. */
  price: number;
}

export const products: Product[] = [
  { id: 1, name: 'Pineapple', emoji: '🍍', price: 349 },
  { id: 2, name: 'Bananas', emoji: '🍌', price: 129 },
  { id: 3, name: 'Green Apple', emoji: '🍏', price: 89 },
  { id: 4, name: 'Peach', emoji: '🍑', price: 199 },
];

const productsById = new Map(products.map(product => [product.id, product]));

/** Product id -> quantity. Absent means "not in the cart". */
export type CartState = Record<number, number>;

export interface CartLine {
  product: Product;
  quantity: number;
}

export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const without = (state: CartState, id: number): CartState => {
  const { [id]: _removed, ...rest } = state;
  return rest;
};

export const cartAdapter = buildAdapter<CartState>()({
  add: (state, id: number) => ({ ...state, [id]: (state[id] ?? 0) + 1 }),
  setQuantity: (state, { id, quantity }: { id: number; quantity: number }) =>
    quantity <= 0 ? without(state, id) : { ...state, [id]: quantity },
  removeOne: (state, id: number) => {
    const quantity = (state[id] ?? 0) - 1;
    return quantity <= 0 ? without(state, id) : { ...state, [id]: quantity };
  },
  removeAll: (state, id: number) => without(state, id),
  selectors: {
    lines: (state): CartLine[] =>
      Object.entries(state)
        .map(([id, quantity]) => ({ product: productsById.get(Number(id)), quantity }))
        .filter((line): line is CartLine => !!line.product)
        .sort((a, b) => a.product.id - b.product.id),
  },
})({
  itemCount: s => s.lines.reduce((total, line) => total + line.quantity, 0),
  subtotal: s =>
    s.lines.reduce((total, line) => total + line.product.price * line.quantity, 0),
  isEmpty: s => s.lines.length === 0,
})();

/** Coupon codes the demo recognises, as a fraction off the subtotal. */
export const coupons: Record<string, number> = {
  ADAPT10: 0.1,
  STATE25: 0.25,
};

export const couponAdapter = buildAdapter<string>()({
  clear: () => '',
  selectors: {
    code: state => state.trim().toUpperCase(),
  },
})({
  discountRate: s => coupons[s.code] ?? 0,
  isValid: s => s.code in coupons,
  isRejected: s => s.code.length > 0 && !(s.code in coupons),
})();
