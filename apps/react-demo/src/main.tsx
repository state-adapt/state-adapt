import React from 'react';
import ReactDOM from 'react-dom';
import { AdaptContext } from '../../../libs/react/src';

import { BrowserRouter } from 'react-router-dom';
// import { Provider } from 'react-redux';
import { adapt } from './store';

import App from './app/app';

ReactDOM.render(
  <AdaptContext.Provider value={adapt}>
    {/* <Provider store={store}> */}
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    {/* </Provider> */}
  </AdaptContext.Provider>,
  document.getElementById('root'),
);
