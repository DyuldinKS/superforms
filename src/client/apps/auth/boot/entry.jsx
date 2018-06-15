import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import cleanPreloadedState from 'shared/utils/cleanPreloadedState';
import './styles.scss';
import App from '../authContainer';

const container = document.getElementById('react-root');

let initialState = {};

if (typeof window !== 'undefined' && window.PRELOADED_STATE) {
  initialState = window.PRELOADED_STATE;
  cleanPreloadedState();
}

const render = (Component) => {
  ReactDOM.hydrate(
    <AppContainer>
      <Component {...initialState} />
    </AppContainer>,
    container,
  );
};

render(App);

// Webpack Hot Module Replacement API
if (process.env.NODE_ENV !== 'production') {
  if (module.hot) {
    module.hot.accept('../authContainer', () => { render(App); });
  }
}
