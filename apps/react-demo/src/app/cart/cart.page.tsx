import React from 'react';
import { useDerived, useStore } from '@state-adapt/react';

import { formatPrice, products } from './cart.adapter';
import { cartStore, couponStore, deriveDiscount, deriveTotal } from './cart.store';

export function CartPage() {
  const [cart, cartActions] = useStore(cartStore);
  const [coupon, couponActions] = useStore(couponStore);
  const discount = useDerived(deriveDiscount);
  const total = useDerived(deriveTotal);

  return (
    <>
      <section className="panel">
        <h1>Cart</h1>
        <p className="muted">
          The cart and coupon are separate stores. Shared <code>derive</code> values
          calculate the discount and total across both — neither store imports the other.
        </p>
      </section>

      <section className="card-grid products">
        {products.map(product => (
          <article className="card static product" key={product.id}>
            <span className="emoji" aria-hidden="true">
              {product.emoji}
            </span>
            <h2>{product.name}</h2>
            <p className="muted">{formatPrice(product.price)}</p>
            <button
              className="button primary"
              data-testid={`add-${product.id}`}
              onClick={() => cartActions.add(product.id)}
            >
              Add to cart
            </button>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>Your cart</h2>

        {cart.isEmpty ? (
          <p className="muted empty" data-testid="cart-empty">
            Your cart is empty.
          </p>
        ) : (
          <ul className="cart-list" data-testid="cart-list">
            {cart.lines.map(({ product, quantity }) => (
              <li key={product.id} data-testid={`cart-line-${product.id}`}>
                <span className="emoji" aria-hidden="true">
                  {product.emoji}
                </span>
                <span className="cart-name">{product.name}</span>
                <div className="qty">
                  <button
                    aria-label={`Remove one ${product.name}`}
                    data-testid={`decrease-${product.id}`}
                    onClick={() => cartActions.removeOne(product.id)}
                  >
                    −
                  </button>
                  <span data-testid={`qty-${product.id}`}>{quantity}</span>
                  <button
                    aria-label={`Add one ${product.name}`}
                    data-testid={`increase-${product.id}`}
                    onClick={() => cartActions.add(product.id)}
                  >
                    +
                  </button>
                </div>
                <span className="line-total" data-testid={`line-total-${product.id}`}>
                  {formatPrice(product.price * quantity)}
                </span>
                <button
                  className="icon danger"
                  aria-label={`Remove all ${product.name}`}
                  data-testid={`remove-${product.id}`}
                  onClick={() => cartActions.removeAll(product.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="field">
          <span>
            Coupon code <span className="muted small">(try ADAPT10 or STATE25)</span>
          </span>
          <input
            type="text"
            placeholder="Coupon code"
            data-testid="coupon-input"
            value={coupon.state}
            onChange={event => couponActions.set(event.target.value)}
          />
        </label>

        {coupon.isValid && (
          <p className="note ok" data-testid="coupon-valid">
            {coupon.code} applied — {Math.round(coupon.discountRate * 100)}% off
          </p>
        )}
        {coupon.isRejected && (
          <p className="note bad" data-testid="coupon-invalid">
            {coupon.code} isn&apos;t a valid code
          </p>
        )}

        <dl className="totals">
          <div>
            <dt>Items</dt>
            <dd data-testid="cart-count">{cart.itemCount}</dd>
          </div>
          <div>
            <dt>Subtotal</dt>
            <dd data-testid="cart-subtotal">{formatPrice(cart.subtotal)}</dd>
          </div>
          <div>
            <dt>Discount</dt>
            <dd data-testid="cart-discount">−{formatPrice(discount)}</dd>
          </div>
          <div className="grand">
            <dt>Total</dt>
            <dd data-testid="cart-total">{formatPrice(total)}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
