import * as types from './actionTypes';
import { hasTransitionsBlocked } from './selectors';

function createAction(type) {
  return (to, stateObj = {}) => (
    {
      type,
      to,
      stateObj,
    }
  );
}

export const redirect = createAction(types.REDIRECT);
export const replace = createAction(types.REPLACE);
export const returnTo = createAction(types.RETURN_TO);
export const init = createAction(types.INIT);

export function block(message) {
  return {
    type: types.BLOCK,
    message,
  }
}

export function unblock(message) {
  return {
    type: types.UNBLOCK,
  }
}
