import PARENT_STORE from '../constants';

function getStore(state, entityName) {
  return state[PARENT_STORE][entityName] || {};
}

export function getEntity(state, entityName, entityId) {
  const store = getStore(state, entityName);
  return store.entities[entityId] || {};
}

export function getFetchStatus(state, entityName, entityId) {
  const store = getStore(state, entityName);
  return store.fetchStatus[entityId] || '';
}

export function getError(state, entityName, entityId) {
  const store = getStore(state, entityName);
  return store.errors[entityId] || null;
}
