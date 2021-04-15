import {
  adaptReducer,
  actionSanitizer,
  stateSanitizer,
  createStateAdapt,
} from '@state-adapt/core';
import { combineReducers, createStore } from 'redux';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

export const store = createStore(
  combineReducers({ adapt: adaptReducer }),
  enableReduxDevTools,
);
export const adapt = createStateAdapt(store);