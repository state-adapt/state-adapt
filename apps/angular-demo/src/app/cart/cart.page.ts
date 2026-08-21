import { Component, inject } from '@angular/core';

import { formatPrice, products } from './cart.adapter';
import { CartStores } from './cart.store';

@Component({
  standalone: true,
  selector: 'sa-cart-page',
  template: `
    <section class="panel">
      <h1>Cart</h1>
      <p class="muted">
        The cart and the coupon are two separate stores. The discount and total are
        derived across both — neither store imports the other.
      </p>
    </section>

    <section class="card-grid products">
      @for (product of products; track product.id) {
        <article class="card static product">
          <span class="emoji" aria-hidden="true">{{ product.emoji }}</span>
          <h2>{{ product.name }}</h2>
          <p class="muted">{{ formatPrice(product.price) }}</p>
          <button
            class="button primary"
            [attr.data-testid]="'add-' + product.id"
            (click)="cart.add(product.id)"
          >
            Add to cart
          </button>
        </article>
      }
    </section>

    <section class="panel">
      <h2>Your cart</h2>

      @if (cart.isEmpty()) {
        <p class="muted empty" data-testid="cart-empty">Your cart is empty.</p>
      } @else {
        <ul class="cart-list" data-testid="cart-list">
          @for (line of cart.lines(); track line.product.id) {
            <li [attr.data-testid]="'cart-line-' + line.product.id">
              <span class="emoji" aria-hidden="true">{{ line.product.emoji }}</span>
              <span class="cart-name">{{ line.product.name }}</span>
              <div class="qty">
                <button
                  [attr.aria-label]="'Remove one ' + line.product.name"
                  [attr.data-testid]="'decrease-' + line.product.id"
                  (click)="cart.removeOne(line.product.id)"
                >
                  −
                </button>
                <span [attr.data-testid]="'qty-' + line.product.id">{{ line.quantity }}</span>
                <button
                  [attr.aria-label]="'Add one ' + line.product.name"
                  [attr.data-testid]="'increase-' + line.product.id"
                  (click)="cart.add(line.product.id)"
                >
                  +
                </button>
              </div>
              <span
                class="line-total"
                [attr.data-testid]="'line-total-' + line.product.id"
                >{{ formatPrice(line.product.price * line.quantity) }}</span
              >
              <button
                class="icon danger"
                [attr.aria-label]="'Remove all ' + line.product.name"
                [attr.data-testid]="'remove-' + line.product.id"
                (click)="cart.removeAll(line.product.id)"
              >
                ✕
              </button>
            </li>
          }
        </ul>
      }

      <label class="field">
        <span>
          Coupon code <span class="muted small">(try ADAPT10 or STATE25)</span>
        </span>
        <input
          type="text"
          placeholder="Coupon code"
          data-testid="coupon-input"
          [value]="coupon()"
          (input)="coupon.set($any($event.target).value)"
        />
      </label>

      @if (coupon.isValid()) {
        <p class="note ok" data-testid="coupon-valid">
          {{ coupon.code() }} applied — {{ round(coupon.discountRate() * 100) }}% off
        </p>
      }
      @if (coupon.isRejected()) {
        <p class="note bad" data-testid="coupon-invalid">
          {{ coupon.code() }} isn't a valid code
        </p>
      }

      <dl class="totals">
        <div>
          <dt>Items</dt>
          <dd data-testid="cart-count">{{ cart.itemCount() }}</dd>
        </div>
        <div>
          <dt>Subtotal</dt>
          <dd data-testid="cart-subtotal">{{ formatPrice(cart.subtotal()) }}</dd>
        </div>
        <div>
          <dt>Discount</dt>
          <dd data-testid="cart-discount">−{{ formatPrice(discount()) }}</dd>
        </div>
        <div class="grand">
          <dt>Total</dt>
          <dd data-testid="cart-total">{{ formatPrice(total()) }}</dd>
        </div>
      </dl>
    </section>
  `,
})
export class CartPageComponent {
  products = products;
  formatPrice = formatPrice;
  round = Math.round;

  private stores = inject(CartStores);
  cart = this.stores.cart;
  coupon = this.stores.coupon;
  discount = this.stores.discount;
  total = this.stores.total;
}
