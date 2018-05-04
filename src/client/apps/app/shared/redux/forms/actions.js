import { actions as entity } from 'shared/entities/entity';
import { actions as entities } from 'shared/entities';
import { batchActions } from 'shared/batch';
import { FormAPI } from 'api/';
import entityName from './constants';
import * as types from './actionTypes';
import { getCollectingSettings } from './selectors';

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

// Update form collect settings
export function collectUpdate(id, updates) {
  return async (dispatch, getState) => {
    dispatch(updateRequest(id, updates));

    const curSettings = getCollectingSettings(getState(), id) || {};

    const settings = {
      ...curSettings,
      ...updates,
    };

    try {
      const data = await FormAPI.collect(id, settings);
      data.collecting = settings;
      dispatch(updateSuccess(id, data));
    } catch (error) {
      dispatch(updateFailure(id, error));
    }
  };
}

// Fetch responses in short form for list display
function fetchResponsesRequest(id) {
  return {
    type: types.FETCH_RESPONSES_REQUEST,
    meta: { entityName, id },
  };
}

function fetchResponsesSuccess(id, payload) {
  return {
    type: types.FETCH_RESPONSES_SUCCESS,
    meta: { entityName, id },
    payload,
  };
}

function fetchResponsesFailure(id, error) {
  return {
    type: types.FETCH_RESPONSES_FAILURE,
    meta: { entityName, id },
    error: true,
    payload: error,
  };
}

export function fetchResponses(id) {
  return async (dispatch) => {
    dispatch(fetchResponsesRequest(id));

    try {
      const data = await FormAPI.getResponses(id);
      dispatch(fetchResponsesSuccess(id, data));
    } catch (error) {
      dispatch(fetchResponsesFailure(id, error));
    }
  };
}
