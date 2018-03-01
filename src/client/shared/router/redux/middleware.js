import getURLFromParts from '../utils/getURLFromParts';
import { REDIRECT, REPLACE } from './actionTypes';

const routerMiddleware = () => next => (action) => {
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
