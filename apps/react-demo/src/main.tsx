import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdaptContext, defaultStateAdapt } from '@state-adapt/react';

import { BrowserRouter } from 'react-router-dom';

import App from './app/app';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <AdaptContext.Provider value={defaultStateAdapt}>
    {/* <Provider store={store}> */}
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
    {/* </Provider> */}
  </AdaptContext.Provider>,
);
