import { Injectable, computed } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { CartState, cartAdapter, couponAdapter } from './cart.adapter';

/**
 * Held in an injection context so their state survives navigation. The app
 * shell reads the cart for the nav badge, which keeps it active.
 */
@Injectable({ providedIn: 'root' })
export class CartStores {
  cart = adapt({} as CartState, {
    adapter: cartAdapter,
    path: 'cart',
  });

  coupon = adapt('', {
    adapter: couponAdapter,
    path: 'coupon',
  });

  /**
   * The checkout totals depend on both stores, but neither store needs to know about
   * the other: each store's selectors are signals, so the totals are just derived.
   */
  discount = computed(() =>
    Math.round(this.cart.subtotal() * this.coupon.discountRate()),
  );

  total = computed(() => this.cart.subtotal() - this.discount());
}
