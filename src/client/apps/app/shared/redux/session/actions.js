import * as types from './actionTypes';

export function init(session) {
  return {
    type: types.INIT,
    payload: session,
  };
}

export function update(updates) {
  return {
    type: types.UPDATE,
    payload: updates,
  };
}
