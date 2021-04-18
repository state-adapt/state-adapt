import React from 'react';
import { createAdapter } from '../../../../libs/core/src';
import { useAdapter, useObservable, useSource, useUpdater } from '../../../../libs/react/src';

const abAdapter = createAdapter<string>()({
  concat: (state, newStr: string) => state + newStr,
})

export function App() {
  const click$ = useSource<{test: boolean}>('[App] click$');
  const test$ = useUpdater('test', {test: false}, click$);
  const test = useObservable(test$);

  const a$ = useSource<string>('[App] a$');
  const b$ = useSource<string>('[App] b$');
  const store = useAdapter(['ab', abAdapter, ''], {concat: [a$, b$]})
  const ab = useObservable(store.getState());

  return (
    <div>
      <main>
        <h1>{test?.test.toString()}!</h1>
        <button onClick={() => click$.next({test: true})}>Click</button>
        <h1>ab: {ab}</h1>
        <button onClick={() => a$.next('a')}>a</button>
        <button onClick={() => b$.next('b')}>b</button>
      </main>
    </div>
  );
}

export default App;
