import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import routerMiddleware from 'shared/router/redux/middleware';
import cleanPreloadedState from 'shared/utils/cleanPreloadedState';
import rootReducer from './reducer';

function injectReduxDevTools() {
  return typeof window !== 'undefined' && window.devToolsExtension ?
    window.devToolsExtension() :
    f => f;
}

export default () => {
  let initialState = {};

  if (typeof window !== 'undefined' && window.PRELOADED_STATE) {
    initialState = {
      ...initialState,
      ...window.PRELOADED_STATE,
    };
    cleanPreloadedState();
  }

  return createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(
        routerMiddleware,
        thunk,
      ),
      injectReduxDevTools(),
    ),
  );
};
