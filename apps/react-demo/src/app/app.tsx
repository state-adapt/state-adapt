import React from 'react';
import { createAdapter } from '@state-adapt/core';
import { useAdapter, useObservable, useSource, useUpdater } from '@state-adapt/react';
import styles from './app.module.scss';

const abAdapter = createAdapter<string>()({
  concat: (state, newStr: string) => state + newStr,
})

export function App() {
  const clicko$ = useSource<{test: boolean}>('[App] clicko$');
  const test$ = useUpdater('test', {test: false}, clicko$);
  const test = useObservable(test$);

  const a$ = useSource<string>('[App] a$');
  const b$ = useSource<string>('[App] b$');
  const store = useAdapter(['ab', abAdapter, ''], {concat: [a$, b$]})
  const ab$ = store.getState();
  const ab = useObservable(ab$);

  return (
    <div className={styles.app}>
      <main>
        <h1>React is a {test?.test.toString()}!</h1>
        <button onClick={() => clicko$.next({test: true})}>Clicko</button>
        <h1>ab stuff: {ab}</h1>
        <button onClick={() => a$.next('a')}>a</button>
        <button onClick={() => a$.next('b')}>b</button>
      </main>
    </div>
  );
}

export default App;
