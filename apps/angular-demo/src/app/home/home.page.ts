import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { interval } from 'rxjs';
import { toSignal } from '@state-adapt/angular';

/** A plain observable, rendered straight into the view with `toSignal`. */
const onSeconds = interval(1000);

const demos = [
  {
    to: '/counter',
    title: 'Counter',
    blurb: 'Reusable adapters, derived selectors, and one source resetting many stores.',
    api: ['createAdapter', 'adapt', 'source', 'joinStores'],
    testId: 'card-counter',
  },
  {
    to: '/todos',
    title: 'Todos',
    blurb: 'Layered, memoized selectors filtering a list without a single computed.',
    api: ['buildAdapter', 'adapt'],
    testId: 'card-todos',
  },
  {
    to: '/cart',
    title: 'Cart',
    blurb: 'Two independent stores combined into totals neither one knows about.',
    api: ['buildAdapter', 'adapt', 'computed'],
    testId: 'card-cart',
  },
  {
    to: '/crew',
    title: 'Flight Operations',
    blurb:
      'A normalized roster with filtered bulk actions, sorting, upserts, and detail views.',
    api: ['createEntityAdapter', 'createEntityState', 'adapt'],
    testId: 'card-crew',
  },
  {
    to: '/live',
    title: 'Live',
    blurb:
      'A store fed by an RxJS interval, subscribing and tearing down as you navigate.',
    api: ['source', 'toSource', 'adapt'],
    testId: 'card-live',
  },
];

@Component({
  selector: 'sa-home-page',
  imports: [RouterLink],
  template: `
    <section class="hero" data-testid="hero">
      <h1>
        State management that
        <span class="accent">adapts</span>
      </h1>
      <p class="lede">
        A tour of StateAdapt in Angular — reusable state logic, memoized selectors, and
        declarative sources. State on these pages survives navigation, so wander between
        them.
      </p>
      <p class="muted small" data-testid="uptime">
        This page has been open for {{ ticks() + 1 }}s (straight from an RxJS
        <code>interval</code>
        via
        <code>toSignal</code>
        )
      </p>
    </section>

    <section class="card-grid">
      @for (demo of demos; track demo.to) {
      <a class="card" [routerLink]="demo.to" [attr.data-testid]="demo.testId">
        <h2>{{ demo.title }}</h2>
        <p class="muted">{{ demo.blurb }}</p>
        <ul class="tag-list">
          @for (name of demo.api; track name) {
          <li>
            <code>{{ name }}</code>
          </li>
          }
        </ul>
      </a>
      }
    </section>
  `,
})
export class HomePageComponent {
  demos = demos;
  ticks = toSignal(onSeconds, { initialValue: -1 });
}
