import NAME from './constants';

export function getStore(state) {
  return state[NAME];
}

export function getUserId(state) {
  return getStore(state).userId;
}

export function getOrgId(state) {
  return getStore(state).orgId;
}

export function isSessionUser(state, userId) {
  return getUserId(state) === userId;
}
