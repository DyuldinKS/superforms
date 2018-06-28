import NAME from './constants';

export function getStore(state) {
  return state[NAME];
}

export function hasTransitionsBlocked(state) {
  return getStore(state).blocked;
}

export function getBlockMessage(state) {
  return getStore(state).blockMessage;
}
