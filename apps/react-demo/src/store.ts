import {
  // adaptReducer,
  actionSanitizer,
  stateSanitizer,
} from '@state-adapt/core';
import {
  createStore,
  // createStateAdapt
} from '@state-adapt/rxjs';

// import { combineReducers, createStore } from 'redux';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

// export const store = createStore(
//   combineReducers({ adapt: adaptReducer }),
//   enableReduxDevTools,
// );
// export const adapt = createStateAdapt(store);
export const adapt = createStore(enableReduxDevTools);
