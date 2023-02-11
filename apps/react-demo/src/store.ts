import { defaultStateAdapt } from '@state-adapt/react';
export const adapt = defaultStateAdapt.adapt.bind(defaultStateAdapt);
export const watch = defaultStateAdapt.watch.bind(defaultStateAdapt);

// import { combineReducers, createStore } from 'redux';

// const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
//   actionSanitizer,
//   stateSanitizer,
// });

// // export const store = createStore(
// //   combineReducers({ adapt: adaptReducer }),
// //   enableReduxDevTools,
// // );
// // export const adapt = createStateAdapt(store);
// export const adapt = createStore(enableReduxDevTools);
