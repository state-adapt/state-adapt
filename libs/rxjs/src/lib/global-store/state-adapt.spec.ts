import {
  actionSanitizer,
  buildAdapter,
  createAdapter,
  joinAdapters,
  stateSanitizer,
} from '@state-adapt/core';
import { toSource } from '@state-adapt/rxjs';
import { NEVER, interval, of } from 'rxjs';
import { configureStateAdapt } from './configure-state-adapt.function';
import { switchMap } from 'rxjs/operators';
import { source } from '../sources/source.function';
import { Source } from '../sources/source';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});
const stateAdapt = configureStateAdapt({ devtools: enableReduxDevTools });
const { adapt, watch } = stateAdapt;

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

// Jest hates timeoutes, but this is to test types
const interval7$ = NEVER.pipe(
  switchMap(() => interval(7000).pipe(toSource('interval7$'))),
);
const interval3$ = NEVER.pipe(
  switchMap(() => interval(3000).pipe(toSource('interval3$'))),
);

describe('StateAdapt', () => {
  const store4 = adapt(10);

  it('should take initial state as 1st argument', () => {
    let state;
    store4.state$.subscribe(s => {
      // Synchronous
      state = s;
    });
    expect(state).toBe(10);
    store4.set(5);
    expect(state).toBe(5);
    store4.reset();
    expect(state).toBe(10);
    // @ts-expect-error Should take number
    store4.set('5');
    // @ts-expect-error Should not use index signature
    store4.asdf$;
    store4.state$;
    store4.noop;
  });

  const initialState = { a: 5, b: 5 };

  const store3 = adapt(initialState, numbersAdapter);
  it('should take adapter as 2nd argument', () => {
    let state;
    store3.state$.subscribe(s => {
      // Synchronous
      state = s;
    });
    expect(state).toEqual({ a: 5, b: 5 });

    let bOctuple;
    store3.bOctuple$.subscribe(s => {
      // Synchronous
      bOctuple = s;
    });
    expect(bOctuple).toBe(40);

    // check for methods
    let aDouble;
    store3.state$.subscribe(s => {
      // Synchronous
      aDouble = s.a;
    });
    store3.doubleA();
    expect(aDouble).toBe(10);
    store3.reset();
    expect(aDouble).toBe(5);
  });

  it('should take adapter definition', () => {
    const store3aa = adapt(1, {
      add: (state, payload: number) => state + payload,
      selectors: {
        double: state => state * 2,
      },
    });
    let double;
    store3aa.double$.subscribe(s => {
      // Synchronous
      double = s;
    });
    expect(double).toBe(2);
    store3aa.add(2);
    expect(double).toBe(6);
    store3aa.state$;
    store3aa.noop;

    const store3aa2 = adapt(1, {
      adapter: {
        add: (state, payload: number) => state + payload,
        selectors: {
          double: state => state * 2,
        },
      },
    });
    let double2;
    store3aa2.double$.subscribe(s => {
      // Synchronous
      double2 = s;
    });
    expect(double2).toBe(2);
    store3aa2.add(2);
    expect(double2).toBe(6);
    store3aa2.state$;
    store3aa2.noop;

    const store3aa3 = adapt(1, {
      adapter: {
        increment: (state, n: number) => state + n,
      },
      sources: {
        increment: interval7$,
      },
    });
    let state3aa3 = 1;
    store3aa3.state$.subscribe(s => {
      // Synchronous
      state3aa3 = s;
    });
    expect(state3aa3).toBe(1);
    store3aa3.increment(1);
    expect(state3aa3).toBe(2);
    store3aa3.state$;
    store3aa3.noop;

    const store3aa4 = adapt(1, {
      // @ts-expect-error Should take number as payload
      sources: of('asdf').pipe(toSource('increment')),
    });
    const store3aa5 = adapt(1, {
      sources: {
        set: of(7).pipe(toSource('increment')),
      },
    });
    store3aa5.set;
    // @ts-expect-error Should expect number as payload
    store3aa5.set = (payload: string) => {};
  });

  // Test simple Observable, Observable[], Source and Source[]
  it('should take simple sources', () => {
    const store3a = adapt(5, {
      sources: of(2),
    });
    let state3a = 5;
    store3a.state$.subscribe(s => {
      // Synchronous
      state3a = s;
    });
    expect(state3a).toBe(2);
    const store3a2 = adapt(5, {
      // @ts-expect-error Should take number as payload
      sources: of('2'),
    });

    const store3b = adapt(5, {
      sources: [of(3)],
    });
    let state3b = 5;
    store3b.state$.subscribe(s => {
      // Synchronous
      state3b = s;
    });
    expect(state3b).toBe(3);
    const store3b2 = adapt(5, {
      // @ts-expect-error Should take number as payload
      sources: [of('2'), of(3)],
    });

    const store3c = adapt(5, {
      sources: of(2).pipe(toSource()),
    });
    let state3c = 5;
    store3c.state$.subscribe(s => {
      // Synchronous
      state3c = s;
    });
    expect(state3c).toBe(2);
    const store3c2 = adapt(5, {
      // @ts-expect-error Should take number as payload
      sources: of('2').pipe(toSource()),
    });

    const store3d = adapt(5, {
      sources: [of(3)].map(toSource()),
    });
    let state3d = 5;
    store3d.state$.subscribe(s => {
      // Synchronous
      state3d = s;
    });
    expect(state3d).toBe(3);
    const store3d2 = adapt(5, {
      // @ts-expect-error Should take number as payload
      sources: [of('2'), of(3)].map(toSource()),
    });
  });

  it('types should destinguish between plain observables and sources with complex sources object', () => {
    const adapter = createAdapter<number>()({
      add: (state, by: number) => state + by,
      subtract: (state, by: number) => state - by,
    });
    const store3a = adapt(5, {
      adapter,
      sources: {
        set: [of(4)],
        add: of(2).pipe(toSource('asdf')),
        subtract: interval7$,
      },
    });
    const store3b = adapt(5, {
      adapter,
      // @ts-expect-error Should take number as payload
      sources: {
        set: [of(4)],
        add: of('3'),
      },
    });
    const store3c = adapt(5, {
      adapter,
      // @ts-expect-error Should take number as payload
      sources: {
        set: [of(4)],
        subtract: [of('3').pipe(toSource('fdsa'))],
      },
    });
    // TODO: Allow mixed array types
    // const store3d = adapt(5, {
    //   adapter,
    //   sources: {
    //     set: [of(4)],
    //     add: [of(3), interval3$],
    //   },
    // });
  });

  const store3b = adapt(5, {
    double: state => state * 2,
    selectors: {
      double: s => s * 2,
    },
  });
  store3b.state$.subscribe();
  // @ts-expect-error Should take number as payload
  store3b.set('4');

  const store = adapt(initialState, {
    adapter: numbersAdapter,
    sources: {
      doubleA: interval7$,
      doubleB: interval3$,
      noop: interval7$,
    },
  });

  // @ts-expect-error Property should be Observable<number> not Observable<any>
  const sub5 = store.bQuadruple$.subscribe((s: string) => {});
  // @ts-expect-error Property should be Observable<number> not Observable<any>
  const sub6 = store.aDouble$.subscribe((s: string) => {});

  function checkTypes() {
    // Should be good
    const m5 = store.set({ a: 4, b: 4 });
    const m51 = store.setA(4);
    // @ts-expect-error Property should take {a: number; b: number}
    const m6 = store.set({ a: 4, b: '4' });
    // @ts-expect-error Property should number
    const m61 = store.setA({ a: 4, b: '4' });
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

  it('should be availabe to watch', () => {
    let state;
    watch(store.__.path, numbersAdapter).state$.subscribe(s => {
      // Synchronous
      state = s;
    });
    expect(state).toBe(initialState);

    let bOctuple;
    watch(store.__.path, numbersAdapter).bOctuple$.subscribe(s => {
      // Synchronous
      bOctuple = s;
    });
    expect(bOctuple).toBe(40);
  });

  const store2 = adapt(initialState, {
    adapter: numbersAdapter,
    sources: watched => {
      try {
        const sub1 = watched.state$.subscribe(({ a, b }) => a * b * 3);
        // @ts-expect-error watched.state$ should be Observable<{a: number; b: number}>
        const sub2 = watched.state$.subscribe(({ a, b }) => a.split(''));
      } catch (e) {
        console.log(e);
      }

      return {
        doubleA: of(1).pipe(toSource('watched doubleA')),
      };
      return {
        doubleB: watched.state$, // Should be Source
      };
    },
  });

  it('should react to recursive source', () => {
    let state;
    store2.state$.subscribe(s => {
      // Synchronous
      state = s;
    });
    expect(state).toEqual({ a: 10, b: 5 });
  });

  // See https://github.com/state-adapt/state-adapt/issues/67
  // it('should not allow extra source properties in sources', () => {
  //   const store3c = adapt(5, {
  //     adapter: {
  //       double: state => state * 2,
  //     },
  //     sources: {
  //       double: interval7$,
  //       // @ts-expect-error This reaction doesn't exist
  //       ancramant: interval3$,
  //     },
  //   });

  //   const store = adapt(1, {
  //     adapter: {
  //       increment: (state, n: number) => state + n,
  //     },
  //     sources: watched => ({
  //       increment: interval7$,
  //       // @ts-expect-error This reaction doesn't exist
  //       ancramant: interval3$,
  //     }),
  //   });
  //   expect(true).toBe(true);
  // });
});

describe('StateAdapt with source', () => {
  it('should handle simple source', () => {
    const onClick = source<number>('onClick');
    const store = adapt(1, {
      adapter: {
        increment: (state, n: number) => state + n,
      },
      sources: {
        increment: onClick,
      },
    });
    let result = 0;
    store.state$.subscribe(s => {
      // Synchronous
      result = s;
    });
    expect(result).toBe(1);
    onClick(1);
    expect(result).toBe(2);
  });

  it('should handle mixture of Source and source', () => {
    const onClick = source<number>('onClick');
    const click$ = new Source<number>('click$');
    const onEvent = source<number>('onEvent');
    const event$ = new Source<number>('event$');

    const store = adapt(1, {
      adapter: {
        add: (state, n: number) => state + n,
        subtract: (state, n: number) => state - n,
        multiply: (state, n: number) => state * n,
      },
      sources: {
        add: onClick,
        subtract: click$,
        multiply: [onEvent, event$],
      },
    });
    let result = 0;
    store.state$.subscribe(s => {
      // Synchronous
      result = s;
    });
    expect(result).toBe(1);
    onClick(1);
    expect(result).toBe(2);
    click$.next(1);
    expect(result).toBe(1);
    onEvent(2);
    expect(result).toBe(2);
    event$.next(3);
    expect(result).toBe(6);
  });
});
