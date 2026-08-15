import React from 'react';
import { Link } from 'react-router-dom';
import { interval } from 'rxjs';
import { useObservable } from '@state-adapt/react';

/** A plain observable, rendered straight into the view with `useObservable`. */
const seconds$ = interval(1000);

const demos = [
  {
    to: '/counter',
    title: 'Counter',
    blurb: 'Reusable adapters, derived selectors, and one source resetting many stores.',
    api: ['createAdapter', 'useAdapt', 'useSource', 'joinStores'],
    testId: 'card-counter',
  },
  {
    to: '/todos',
    title: 'Todos',
    blurb: 'Layered, memoized selectors filtering a list without a single useMemo.',
    api: ['buildAdapter', 'useStore'],
    testId: 'card-todos',
  },
  {
    to: '/cart',
    title: 'Cart',
    blurb: 'Two independent stores combined into totals neither one knows about.',
    api: ['buildAdapter', 'joinStores', 'useStore'],
    testId: 'card-cart',
  },
  {
    to: '/live',
    title: 'Live',
    blurb:
      'A store fed by an RxJS interval, subscribing and tearing down as you navigate.',
    api: ['source', 'toSource', 'useStore'],
    testId: 'card-live',
  },
];

export function Home() {
  const ticks = useObservable(seconds$, -1);

  return (
    <>
      <section className="hero" data-testid="hero">
        <h1>
          State management that <span className="accent">adapts</span>
        </h1>
        <p className="lede">
          A tour of StateAdapt in React — reusable state logic, memoized selectors, and
          declarative sources. State on these pages survives navigation, so wander
          between them.
        </p>
        <p className="muted small" data-testid="uptime">
          This page has been open for {ticks + 1}s (straight from an RxJS{' '}
          <code>interval</code> via <code>useObservable</code>)
        </p>
      </section>

      <section className="card-grid">
        {demos.map(demo => (
          <Link className="card" key={demo.to} to={demo.to} data-testid={demo.testId}>
            <h2>{demo.title}</h2>
            <p className="muted">{demo.blurb}</p>
            <ul className="tag-list">
              {demo.api.map(name => (
                <li key={name}>
                  <code>{name}</code>
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </section>
    </>
  );
}
