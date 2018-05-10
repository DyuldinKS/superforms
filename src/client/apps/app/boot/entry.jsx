import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import Moment from 'moment';
import store from './store';
import './styles.scss';
import App from '../appContainer';

Moment.locale('ru');

const container = document.getElementById('react-root');

const render = (Component) => {
  ReactDOM.hydrate(
    <AppContainer>
      <Provider store={store}>
        <Component />
      </Provider>
    </AppContainer>,
    container,
  );
};

render(App);

// Webpack Hot Module Replacement API
if (process.env.NODE_ENV !== 'production') {
  if (module.hot) {
    module.hot.accept('../appContainer', () => { render(App); });
  }
}
