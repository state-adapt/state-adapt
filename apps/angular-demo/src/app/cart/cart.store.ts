import { Injectable } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { joinStores } from '@state-adapt/rxjs';
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
   * `joinStores` derives state across store boundaries: the total depends on both
   * the cart and the coupon, but neither store needs to know about the other.
   */
  checkout = joinStores({
    cart: this.cart,
    coupon: this.coupon,
  })({
    discount: s => Math.round(s.cartSubtotal * s.couponDiscountRate),
  })({
    total: s => s.cartSubtotal - s.discount,
  })();
}
