import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdaptContext } from '../../../libs/react/src';

import { BrowserRouter } from 'react-router-dom';
// import { Provider } from 'react-redux';
import { adapt } from './store';

import App from './app/app';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <AdaptContext.Provider value={adapt}>
    {/* <Provider store={store}> */}
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
    {/* </Provider> */}
  </AdaptContext.Provider>,
);
