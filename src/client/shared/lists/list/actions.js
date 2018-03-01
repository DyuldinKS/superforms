import * as types from './actionTypes';

export function fetchRequest(listId, options) {
  return {
    type: types.FETCH_REQUEST,
    meta: { listId },
    payload: options,
  };
}

export function fetchSuccess(listId, list) {
  return {
    type: types.FETCH_SUCCESS,
    meta: { listId },
    payload: list,
  };
}

export function fetchFailure(listId, error) {
  return {
    type: types.FETCH_FAILURE,
    meta: { listId },
    error: true,
    payload: error,
  };
}

export function selectEntry(listId, entryId) {
  return {
    type: types.SELECT_ENTRY,
    meta: { listId },
    payload: { entryId },
  };
}

export function unselectEntry(listId, entryId) {
  return {
    type: types.UNSELECT_ENTRY,
    meta: { listId },
    payload: { entryId },
  };
}
