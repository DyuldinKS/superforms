import * as types from './actionTypes';

export function add(entitiesMap) {
  return {
    type: types.ADD,
    payload: entitiesMap,
  };
}
