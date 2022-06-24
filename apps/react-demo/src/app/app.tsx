import React from 'react';
import { createAdapter } from '../../../../libs/core/src';
import { useAdapter, useObservable, useSource } from '../../../../libs/react/src';

const abAdapter = createAdapter<string>()({
  concat: (state, newStr: string) => state + newStr,
});

export function App() {
  const click$ = useSource<{ test: boolean }>('[App] click$');

  const resetBoth$ = useSource<void>('[App] resetBoth$');

  const store1 = useAdapter(['ab1', abAdapter, ''], { reset: resetBoth$ });
  const ab1 = useObservable(store1.state$);

  const store2 = useAdapter(['ab2', abAdapter, ''], { reset: resetBoth$ });
  const ab2 = useObservable(store2.state$);

  return (
    <div>
      <main>
        <button onClick={() => click$.next({ test: true })}>Make True</button>
        <h1>ab1: {ab1}</h1>
        <button onClick={() => store1.concat('a')}>a</button>
        <button onClick={() => store1.concat('b')}>b</button>
        <h1>ab2: {ab2}</h1>
        <button onClick={() => store2.concat('a')}>a</button>
        <button onClick={() => store2.concat('b')}>b</button>
        <br />
        <br />
        <button onClick={() => resetBoth$.next()}>Reset Both</button>
      </main>
    </div>
  );
}

export default App;
