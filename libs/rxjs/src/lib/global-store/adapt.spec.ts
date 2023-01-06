import {
  actionSanitizer,
  buildAdapter,
  createAdapter,
  joinAdapters,
  stateSanitizer,
} from '@state-adapt/core';
import { toSource } from '@state-adapt/rxjs';
import { interval } from 'rxjs';
import { createStore } from './create-store.function';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

const adapt = createStore(enableReduxDevTools);

const simpleNumberAdapter = createAdapter<number>()({
  double: state => state * 2,
  selectors: {
    double: s => s * 2,
  },
});

const numberAdapter = buildAdapter<number>()(simpleNumberAdapter)({
  quadruple: s => s.double * 2,
})({
  octuple: s => {
    // @ts-expect-error Should be number
    const double: string = s.double;
    return s.double * 4;
  },
})();

// Should all be typed correctly
// @ts-expect-error Should return number
const a: (s: number) => string = numberAdapter.selectors.double;
// @ts-expect-error Should return number
const a2: (s: number) => string = numberAdapter.selectors.quadruple;
// @ts-expect-error Should return number
const a22: (s: number) => string = numberAdapter.selectors.octuple;
// @ts-expect-error Should return number
const a3: (s: number) => string = numberAdapter.double;
// Should be good
const a4 = numberAdapter.set(4, 5);
// @ts-expect-error Should take number as payload
const a5 = numberAdapter.set(4, '5');

const numbersAdapter = joinAdapters<{ a: number; b: number }>()({
  a: simpleNumberAdapter,
  b: numberAdapter,
})({
  rando: s => s.state,
})();

// Should all be typed correctly
// @ts-expect-error Should return number
const c: (s: number) => string = numbersAdapter.selectors.bDouble;
// @ts-expect-error Should return number
const c2: (s: number) => string = numbersAdapter.selectors.bQuadruple;
// @ts-expect-error Should return number
const c3: (s: number) => string = numbersAdapter.selectors.bOctuple;
// @ts-expect-error Should return {a: number; b: number}
const d: (s: number) => string = numbersAdapter.doubleB;
// @ts-expect-error Should not exist for primitive child adapter
const d2 = numbersAdapter.updateA;
// @ts-expect-error Should return number
const e: (s: number) => string = numbersAdapter.selectors.aDouble;
// @ts-expect-error Should return {a: number; b: number}
const f: (s: number) => string = numbersAdapter.selectors.rando;
// @ts-expect-error Should return {a: number; b: number}
const g: (s: number) => string = numbersAdapter.doubleA;

const interval7$ = interval(7000).pipe(toSource('interval7$'));
const interval3$ = interval(3000).pipe(toSource('interval3$'));

describe('Adapt', () => {
  const initialState = { a: 5, b: 5 };
  const store = adapt.init(['numberA', initialState, numbersAdapter], {
    // doubleA: interval7$,
    // doubleB: interval3$,
  });

  // @ts-expect-error Property should be Observable<number> not Observable<any>
  const sub5 = store.bQuadruple$.subscribe((s: string) => {});
  // @ts-expect-error Property should be Observable<number> not Observable<any>
  const sub6 = store.aDouble$.subscribe((s: string) => {});

  function doUnreasonableThings() {
    // Should be good
    const m5 = store.set({ a: 4, b: 4 });
    // @ts-expect-error Property should take {a: number; b: number}
    const m6 = store.set({ a: 4, b: '4' });
    // @ts-expect-error Should recognize undefined property
    const sub55 = store.bQzuadruple$.subscribe(s => {});
  }

  it('should emit initial state', () => {
    let state;
    store.state$.subscribe(s => {
      // Synchronous
      state = s;
    });
    expect(state).toBe(initialState);
  });

  it('should emit 8x initial b state (5)', () => {
    let bOctuple;
    store.bOctuple$.subscribe(s => {
      // Synchronous
      bOctuple = s;
    });
    expect(bOctuple).toBe(40);
  });
});
