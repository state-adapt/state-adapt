import React from 'react';
import { useAdapt, useSource } from '@state-adapt/react';

import { LiveTicker } from '../live';
import { counterAdapter } from './counter.adapter';

export function CounterPage() {
  // One source, wired into both counters below: a single event, two reactions.
  const onResetAll = useSource<void>('[Counter] onResetAll');

  // The step size is ordinary local state — `useAdapt` with no adapter behaves
  // much like `useState`, plus a `reset`. It holds the raw input text so that
  // clearing the field leaves it empty rather than snapping back to 0.
  const [step, setStep] = useAdapt('1');

  const [a, setA] = useAdapt(0, {
    adapter: counterAdapter,
    sources: { reset: onResetAll },
    path: 'counterA',
  });

  const [b, setB] = useAdapt(10, {
    adapter: counterAdapter,
    sources: { reset: onResetAll },
    path: 'counterB',
  });

  const stepSize = Number(step.state) || 0;

  return (
    <>
      <section className="panel">
        <h1>Counter</h1>
        <p className="muted">
          Both counters share one <code>counterAdapter</code> — the same reactions and
          selectors, two independent stores. The reset button is a{' '}
          <code>source</code> both stores react to; no callback wiring between them.
        </p>

        <label className="field narrow">
          <span>Step size</span>
          <input
            type="number"
            data-testid="step-input"
            value={step.state}
            onChange={event => setStep(event.target.value)}
          />
        </label>
      </section>

      <div className="card-grid">
        <Counter name="A" testId="counter-a" state={a} store={setA} step={stepSize} />
        <Counter name="B" testId="counter-b" state={b} store={setB} step={stepSize} />
      </div>

      <section className="panel">
        <div className="row">
          <div>
            <span className="muted small">Sum of both counters</span>
            <p className="stat" data-testid="counter-sum">
              {a.state + b.state}
            </p>
          </div>
          <button
            className="button danger"
            data-testid="reset-all"
            onClick={() => onResetAll.next()}
          >
            Reset both
          </button>
        </div>

        {/* The same store the /live route uses — this route is the second subscriber. */}
        <LiveTicker />
      </section>
    </>
  );
}

interface CounterProps {
  name: string;
  testId: string;
  step: number;
  state: { state: number; parity: string; isEven: boolean; isNegative: boolean };
  store: {
    increment: (step: number) => void;
    decrement: (step: number) => void;
    double: () => void;
    negate: () => void;
    reset: () => void;
  };
}

function Counter({ name, testId, state, store, step }: CounterProps) {
  return (
    <section className="card static" data-testid={testId}>
      <h2>Counter {name}</h2>
      <p className={`stat ${state.isNegative ? 'negative' : ''}`} data-testid={`${testId}-value`}>
        {state.state}
      </p>
      <p className="muted small">
        Selector says it&apos;s{' '}
        <strong data-testid={`${testId}-parity`}>{state.parity}</strong>
      </p>
      <div className="button-row">
        <button data-testid={`${testId}-decrement`} onClick={() => store.decrement(step)}>
          −{step}
        </button>
        <button data-testid={`${testId}-increment`} onClick={() => store.increment(step)}>
          +{step}
        </button>
        <button data-testid={`${testId}-double`} onClick={() => store.double()}>
          ×2
        </button>
        <button data-testid={`${testId}-negate`} onClick={() => store.negate()}>
          ±
        </button>
        <button
          className="ghost"
          data-testid={`${testId}-reset`}
          onClick={() => store.reset()}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
