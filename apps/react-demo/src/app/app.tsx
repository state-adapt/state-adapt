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

  const count1 = useAdapt('count1', 0);
  const count2 = useAdapt(['count2', 0], interval$);
  const count3 = useAdapt(['count3', 0], countAdapter);
  const count4 = useAdapt(['count4', 10], {
    multiply: (state, n: number) => state * n,
  });
  const count5 = useAdapt(['count5', 0, countAdapter], interval$);
  const count6 = useAdapt(['count6', 0, countAdapter], {
    set: interval$,
    reset: resetAll$,
  });

  // count1.set();
  // count2.set();
  // count3.double(4);
  // count4.multiply('4');
  // count5.set('4');
  // count6.increment();

  const state1 = useObservable(count1.state$);
  const state2 = useObservable(count2.state$);
  const state3 = useObservable(count3.state$);
  const bold3 = useObservable(count3.bold$);
  const state4 = useObservable(count4.state$);
  const state5 = useObservable(count5.state$);
  const bold5 = useObservable(count5.bold$);
  const state6 = useObservable(count6.state$);
  const bold6 = useObservable(count6.bold$);

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
            <button onClick={() => count1.set(300)}>Set</button>
            {/* <button onClick={() => count1.increment(3)}>Increment</button> */}
            {/* <button onClick={() => count1.double()}>Double</button> */}
          </p>
        </div>

        <div>
          <h2>Counter 2</h2>
          <p>
            {state2}
            {/* <span dangerouslySetInnerHTML={{ __html: bold2 || '' }}></span> */}
          </p>
          <p>
            <button onClick={() => count2.set(300)}>Set</button>
            {/* <button onClick={() => count2.increment(3)}>Increment</button> */}
            {/* <button onClick={() => count2.double()}>Double</button> */}
          </p>
        </div>

        <div>
          <h2>Counter 3</h2>
          <p>
            {state3} <span dangerouslySetInnerHTML={{ __html: bold3 || '' }}></span>
          </p>
          <p>
            <button onClick={() => count3.set(300)}>Set</button>
            <button onClick={() => count3.increment(3)}>Increment</button>
            <button onClick={() => count3.double()}>Double</button>
          </p>
        </div>

        <div>
          <h2>Counter 4</h2>
          <p>
            {state4}
            {/* <span dangerouslySetInnerHTML={{ __html: bold4 || '' }}></span> */}
          </p>
          <p>
            <button onClick={() => count4.set(300)}>Set</button>
            <button onClick={() => count4.multiply(10)}>Multiply By 10</button>
            {/* <button onClick={() => count4.increment(3)}>Increment</button> */}
            {/* <button onClick={() => count4.double()}>Double</button> */}
          </p>
        </div>

        <div>
          <h2>Counter 5</h2>
          <p>
            {state5} <span dangerouslySetInnerHTML={{ __html: bold5 || '' }}></span>
          </p>
          <p>
            <button onClick={() => count5.set(300)}>Set</button>
            <button onClick={() => count5.increment(3)}>Increment</button>
            <button onClick={() => count5.double()}>Double</button>
          </p>
        </div>

        <div>
          <h2>Counter 6</h2>
          <p>
            {state6} <span dangerouslySetInnerHTML={{ __html: bold6 || '' }}></span>
          </p>
          <p>
            <button onClick={() => count6.set(300)}>Set</button>
            <button onClick={() => count6.increment(3)}>Increment</button>
            <button onClick={() => count6.double()}>Double</button>
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
