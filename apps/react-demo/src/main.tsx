import React from 'react';
import ReactDOM from 'react-dom';
import {AdaptContext} from '@state-adapt/react';

import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { adapt, store } from './redux';

import App from './app/app';

ReactDOM.render(
  <AdaptContext.Provider value={adapt}>
    <Provider store={store}>
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    </Provider>
  </AdaptContext.Provider>,
  document.getElementById('root'),
);
