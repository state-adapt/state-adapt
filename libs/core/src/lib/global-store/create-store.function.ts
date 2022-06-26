import { adaptReducer } from './adapt.reducer';
import { createAdaptNestedReducer } from './create-adapt-nested-reducer.function';
import { createStateAdapt } from './create-state-adapt.funciton';

function createReduxLikeStore(reducer: any, preloadedState: any, enhancer: any) {
  let state = preloadedState ?? undefined;
  const listeners: any[] = [];

  if (enhancer) {
    return enhancer(createReduxLikeStore)(reducer, state);
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

export function createStore(enhancer: any, preloadedState: any = null) {
  const store = createReduxLikeStore(
    createAdaptNestedReducer(adaptReducer),
    preloadedState,
    enhancer,
  );
  return createStateAdapt(store);
}
