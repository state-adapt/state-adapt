import React, { useState } from 'react';
import { interval } from 'rxjs';
import { createAdapter } from '@state-adapt/core';
import { toSource } from '@state-adapt/rxjs';
import { useAdapt, useObservable, useSource } from '@state-adapt/react';

export const countAdapter = createAdapter<number>()({
  increment: (state, n: number) => state + n,
  double: state => state * 2,
  selectors: {
    bold: s => s.toString().bold(),
  },
});

export function App() {
  const resetAll$ = useSource<void>('[App] resetAll$');
  const [interval$] = useState(() => interval(5000).pipe(toSource('interval$')));

  const store1 = useAdapt('count1', 0);
  const store2 = useAdapt(['count2', 0], interval$);
  const store3 = useAdapt(['count3', 0], countAdapter);
  const store4 = useAdapt(['count4', 10], {
    multiply: (state, n: number) => state * n,
  });
  const store5 = useAdapt(['count5', 0, countAdapter], interval$);
  const store6 = useAdapt(['count6', 0, countAdapter], {
    set: interval$,
    reset: resetAll$,
  });

  // store1.set();
  // store2.set();
  // store3.double(4);
  // store4.multiply('4');
  // store5.set('4');
  // store6.increment();

  const state1 = useObservable(store1.state$);
  const state2 = useObservable(store2.state$);
  const state3 = useObservable(store3.state$);
  const bold3 = useObservable(store3.bold$);
  const state4 = useObservable(store4.state$);
  const state5 = useObservable(store5.state$);
  const bold5 = useObservable(store5.bold$);
  const state6 = useObservable(store6.state$);
  const bold6 = useObservable(store6.bold$);

  return (
    <div>
      <main>
        <div>
          <h2>Counter 1</h2>
          <p>
            {state1}
            {/* <span dangerouslySetInnerHTML={{ __html: bold1 || '' }}></span> */}
          </p>
          <p>
            <button onClick={() => store1.set(300)}>Set</button>
            {/* <button onClick={() => store1.increment(3)}>Increment</button> */}
            {/* <button onClick={() => store1.double()}>Double</button> */}
          </p>
        </div>

        <div>
          <h2>Counter 2</h2>
          <p>
            {state2}
            {/* <span dangerouslySetInnerHTML={{ __html: bold2 || '' }}></span> */}
          </p>
          <p>
            <button onClick={() => store2.set(300)}>Set</button>
            {/* <button onClick={() => store2.increment(3)}>Increment</button> */}
            {/* <button onClick={() => store2.double()}>Double</button> */}
          </p>
        </div>

        <div>
          <h2>Counter 3</h2>
          <p>
            {state3} <span dangerouslySetInnerHTML={{ __html: bold3 || '' }}></span>
          </p>
          <p>
            <button onClick={() => store3.set(300)}>Set</button>
            <button onClick={() => store3.increment(3)}>Increment</button>
            <button onClick={() => store3.double()}>Double</button>
          </p>
        </div>

        <div>
          <h2>Counter 4</h2>
          <p>
            {state4}
            {/* <span dangerouslySetInnerHTML={{ __html: bold4 || '' }}></span> */}
          </p>
          <p>
            <button onClick={() => store4.set(300)}>Set</button>
            <button onClick={() => store4.multiply(10)}>Multiply By 10</button>
            {/* <button onClick={() => store4.increment(3)}>Increment</button> */}
            {/* <button onClick={() => store4.double()}>Double</button> */}
          </p>
        </div>

        <div>
          <h2>Counter 5</h2>
          <p>
            {state5} <span dangerouslySetInnerHTML={{ __html: bold5 || '' }}></span>
          </p>
          <p>
            <button onClick={() => store5.set(300)}>Set</button>
            <button onClick={() => store5.increment(3)}>Increment</button>
            <button onClick={() => store5.double()}>Double</button>
          </p>
        </div>

        <div>
          <h2>Counter 6</h2>
          <p>
            {state6} <span dangerouslySetInnerHTML={{ __html: bold6 || '' }}></span>
          </p>
          <p>
            <button onClick={() => store6.set(300)}>Set</button>
            <button onClick={() => store6.increment(3)}>Increment</button>
            <button onClick={() => store6.double()}>Double</button>
          </p>
        </div>

        <br />
        <br />
        <button onClick={() => resetAll$.next()}>Reset Externally</button>
      </main>
    </div>
  );
}

export default App;
