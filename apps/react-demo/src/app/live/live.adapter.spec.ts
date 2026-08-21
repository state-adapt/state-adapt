import { LifecycleState, lifecycleAdapter, tickerAdapter } from './live.adapter';

const initial: LifecycleState = {
  status: 'unsubscribed',
  activations: 0,
  teardowns: 0,
};

describe('tickerAdapter', () => {
  it('increments', () => {
    expect(tickerAdapter.increment(0)).toBe(1);
  });

  it('labels the count, pluralising past one', () => {
    const label = (s: number) => (tickerAdapter.selectors.label as any)(s);

    expect(label(0)).toBe('0 ticks');
    expect(label(1)).toBe('1 tick');
    expect(label(2)).toBe('2 ticks');
  });
});

describe('lifecycleAdapter', () => {
  it('records a subscription', () => {
    const next = lifecycleAdapter.record(initial, 'subscribe');

    expect(next).toEqual({ status: 'subscribed', activations: 1, teardowns: 0 });
  });

  it('records a teardown', () => {
    const subscribed = lifecycleAdapter.record(initial, 'subscribe');
    const next = lifecycleAdapter.record(subscribed, 'unsubscribe');

    expect(next).toEqual({ status: 'unsubscribed', activations: 1, teardowns: 1 });
  });

  it('accumulates across repeated cycles', () => {
    const next = (['subscribe', 'unsubscribe', 'subscribe'] as const).reduce(
      (state, event) => lifecycleAdapter.record(state, event),
      initial,
    );

    expect(next).toEqual({ status: 'subscribed', activations: 2, teardowns: 1 });
  });

  it('derives isSubscribed from the status', () => {
    const isSubscribed = (s: LifecycleState) =>
      (lifecycleAdapter.selectors.isSubscribed as any)(s);

    expect(isSubscribed(initial)).toBe(false);
    expect(isSubscribed({ ...initial, status: 'subscribed' })).toBe(true);
  });
});
