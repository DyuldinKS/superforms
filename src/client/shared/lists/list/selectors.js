import PARENT_STORE from '../constants';
import { initialState } from './reducer';

function getStore(state) {
  return state[PARENT_STORE] || {};
}

export function getList(state, listId) {
  const store = getStore(state);
  return store[listId] || initialState;
}

export function getSelected(state, listId) {
  const listStore = getList(state, listId);
  return listStore.selected || initialState.selected;
}
