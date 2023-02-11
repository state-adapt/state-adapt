import { GlobalStore } from './global-store/observable-store';

export function createGlobalStore(
  reducer: any,
  preloadedState: any,
  enhancer?: any,
): GlobalStore<any, any> {
  let state = preloadedState ?? undefined;
  const listeners: any[] = [];

  if (enhancer) {
    return enhancer(createGlobalStore)(reducer, state);
  }

  const dispatch = (action: any) => {
    state = reducer(state, action);
    listeners.forEach(l => l(state));
  };

  dispatch({ type: '@@redux/INIT' + Math.random() });

  return {
    getState: () => state,
    dispatch,
    subscribe: (cb: () => void) => {
      listeners.push(cb);
      return () => listeners.splice(listeners.indexOf(cb), 1);
    },
  };
}
