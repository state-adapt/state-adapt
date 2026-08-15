import { createAdapter } from '@state-adapt/core';
import { LifecycleEvent } from './live.source';

export const tickerAdapter = createAdapter<number>()({
  increment: state => state + 1,
  selectors: {
    label: state => `${state} tick${state === 1 ? '' : 's'}`,
  },
});

export interface LifecycleState {
  status: 'subscribed' | 'unsubscribed';
  activations: number;
  teardowns: number;
}

export const initialLifecycleState: LifecycleState = {
  status: 'unsubscribed',
  activations: 0,
  teardowns: 0,
};

export const lifecycleAdapter = createAdapter<LifecycleState>()({
  record: (state, event: LifecycleEvent): LifecycleState =>
    event === 'subscribe'
      ? { ...state, status: 'subscribed', activations: state.activations + 1 }
      : { ...state, status: 'unsubscribed', teardowns: state.teardowns + 1 },
  selectors: {
    isSubscribed: state => state.status === 'subscribed',
  },
});
