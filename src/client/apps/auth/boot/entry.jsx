import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import './styles.scss';
import App from '../authContainer';

const container = document.getElementById('react-root');

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
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
