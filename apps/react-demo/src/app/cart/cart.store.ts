import { adapt, derive } from '@state-adapt/react';
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
 * These shared derivations compose selectors from independent stores. They are
 * evaluated once through StateAdapt's selector cache, no matter how many
 * components consume them.
 */
export const deriveDiscount = derive(() =>
  Math.round(cartStore.subtotal() * couponStore.discountRate()),
);

export const deriveTotal = derive(() => cartStore.subtotal() - deriveDiscount());
