import { joinStores } from '@state-adapt/rxjs';
import { adapt } from '@state-adapt/react';
import { CartState, cartAdapter, couponAdapter } from './cart.adapter';

/**
 * Declared outside the route component so their state survives navigation. The
 * app shell subscribes to the cart for the nav badge, which keeps it active.
 */
export const cartStore = adapt({} as CartState, {
  adapter: cartAdapter,
  path: 'cart',
});

export const couponStore = adapt('', {
  adapter: couponAdapter,
  path: 'coupon',
});

/**
 * `joinStores` derives state across store boundaries: the total depends on both
 * the cart and the coupon, but neither store needs to know about the other.
 */
export const checkoutStore = joinStores({
  cart: cartStore,
  coupon: couponStore,
})({
  discount: s => Math.round(s.cartSubtotal * s.couponDiscountRate),
})({
  total: s => s.cartSubtotal - s.discount,
})();
