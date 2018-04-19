import { actions as entity } from 'shared/entities/entity';
import { actions as entities } from 'shared/entities';
import { batchActions } from 'shared/batch';
import { FormAPI } from 'api/';
import entityName from './constants';
import * as types from './actionTypes';

// Fetch form entity
export function fetch(id) {
  return async (dispatch) => {
    dispatch(entity.fetchOneRequest(entityName, id));

    try {
      const data = await FormAPI.get(id);
      dispatch(entity.fetchOneSuccess(entityName, id, data));
    } catch (error) {
      dispatch(entity.fetchOneFailure(entityName, id, error));
    }
  };
}

function updateRequest(id, payload) {
  return {
    type: types.UPDATE_REQUEST,
    meta: { entityName, id },
    payload,
  };
}

function updateSuccess(id, payload) {
  return {
    type: types.UPDATE_SUCCESS,
    meta: { entityName, id },
    payload,
  };
}

function updateFailure(id, error) {
  return {
    type: types.UPDATE_FAILURE,
    meta: { entityName, id },
    error: true,
    payload: error,
  };
}

// Update form
export function update(id, payload) {
  return async (dispatch) => {
    dispatch(updateRequest(id, payload));

    try {
      const data = await FormAPI.update(id, payload);
      dispatch(updateSuccess(id, data));
    } catch (error) {
      dispatch(updateFailure(id, error));
    }
  };
}
