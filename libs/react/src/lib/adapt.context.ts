import {
  actionSanitizer,
  stateSanitizer,
  createStore,
} from '../../../../libs/core/src';
import React from 'react';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});
export const adapt = createStore(enableReduxDevTools);

export const AdaptContext = React.createContext(adapt);
