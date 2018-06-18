import getURLFromParts from '../utils/getURLFromParts';
import { REDIRECT, REPLACE, RETURN_TO } from './actionTypes';
import { hasTransitionsBlocked, getBlockMessage } from './selectors';

const blockedActions = [REDIRECT, REPLACE, RETURN_TO];

const routerMiddleware = store => next => (action) => {
  if (blockedActions.some(type => type === action.type)
    && hasTransitionsBlocked(store.getState())) {
    const message = getBlockMessage(store.getState());
    const confirm = window.confirm(message);

    if (!confirm) return;
  }

  if (action.type !== REDIRECT && action.type !== REPLACE) {
    return next(action);
  }

  const { to, stateObj } = action;
  const { origin } = window.location;
  let url;

  if (typeof to === 'object') {
    url = getURLFromParts(to);
  } else {
    url = new URL(to, origin);
  }

  switch (action.type) {
    case REDIRECT:
      window.history.pushState(stateObj, '', url);
      break;
    case REPLACE:
      window.history.replaceState(stateObj, '', url);
      break;
    default:
      break;
  }

  return next(action);
};

export default routerMiddleware;
