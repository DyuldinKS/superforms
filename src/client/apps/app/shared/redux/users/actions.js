import { actions as entity } from 'shared/entities/entity';
import { actions as entities } from 'shared/entities';
import { actions as router } from 'shared/router/redux';
import { batchActions } from 'shared/batch';
import { UserAPI, RecipientAPI } from 'api/';
import entityName from './constants';
import * as types from './actionTypes';

// Create
export function createRequest(chiefOrgId, payload) {
  return {
    type: types.CREATE_REQUEST,
    meta: { entityName, chiefOrgId },
    payload,
  };
}

export function createSuccess(chiefOrgId, payload) {
  return {
    type: types.CREATE_SUCCESS,
    meta: { entityName, chiefOrgId },
    payload,
  };
}

export function createFailure(chiefOrgId, error) {
  return {
    type: types.CREATE_FAILURE,
    meta: { entityName, chiefOrgId },
    error: true,
    payload: error,
  };
}

export function create(chiefOrgId, payload) {
  return async (dispatch) => {
    dispatch(createRequest(chiefOrgId, payload));

    try {
      const data = await UserAPI.create(chiefOrgId, payload);
      const createdId = data.id;

      dispatch(batchActions(
        createSuccess(chiefOrgId, data),
        entity.fetchOneSuccess(entityName, createdId, data),
        router.replace(`/users/${createdId}`),
      ));

      return {};
    } catch (error) {
      return dispatch(createFailure(chiefOrgId, error));
    }
  };
}

// Change status
export function changeStatusRequest(id, status) {
  return {
    type: types.CHANGE_STATUS_REQUEST,
    meta: { entityName, id },
    payload: { status },
  };
}

export function changeStatusSuccess(id, data) {
  return {
    type: types.CHANGE_STATUS_SUCCESS,
    meta: { entityName, id },
    payload: data,
  };
}

export function changeStatusFailure(id, error) {
  return {
    type: types.CHANGE_STATUS_FAILURE,
    meta: { entityName, id },
    error: true,
    payload: error,
  };
}

export function changeStatus(id, status) {
  return async (dispatch) => {
    dispatch(changeStatusRequest(id, status));

    try {
      const data = await RecipientAPI.setStatus(id, status);
      dispatch(changeStatusSuccess(id, data));
    } catch (error) {
      dispatch(changeStatusFailure(id, error));
    }
  };
}

// Change role
export function changeRoleRequest(id, role) {
  return {
    type: types.CHANGE_ROLE_REQUEST,
    meta: { entityName, id },
    payload: { role },
  };
}

export function changeRoleSuccess(id, data) {
  return {
    type: types.CHANGE_ROLE_SUCCESS,
    meta: { entityName, id },
    payload: data,
  };
}

export function changeRoleFailure(id, error) {
  return {
    type: types.CHANGE_ROLE_FAILURE,
    meta: { entityName, id },
    error: true,
    payload: error,
  };
}

export function changeRole(id, role) {
  return async (dispatch) => {
    dispatch(changeRoleRequest(id, role));

    try {
      const data = await UserAPI.setRole(id, role);

      dispatch(changeRoleSuccess(id, data));
    } catch (error) {
      dispatch(changeRoleFailure(id, error));
    }
  };
}

// Change email
export function changeEmailRequest(id, email) {
  return {
    type: types.CHANGE_EMAIL_REQUEST,
    meta: { entityName, id },
    payload: { email },
  };
}

export function changeEmailSuccess(id, data) {
  return {
    type: types.CHANGE_EMAIL_SUCCESS,
    meta: { entityName, id },
    payload: data,
  };
}

export function changeEmailFailure(id, error) {
  return {
    type: types.CHANGE_EMAIL_FAILURE,
    meta: { entityName, id },
    error: true,
    payload: error,
  };
}

export function changeEmail(id, email) {
  return async (dispatch) => {
    dispatch(changeEmailRequest(id, email));

    try {
      const data = await RecipientAPI.setEmail(id, email);
      dispatch(changeEmailSuccess(id, data));
    } catch (error) {
      dispatch(changeEmailFailure(id, error));
    }
  };
}

// Change info
export function changeInfoRequest(id, payload) {
  return {
    type: types.CHANGE_INFO_REQUEST,
    meta: { entityName, id },
    payload,
  };
}

export function changeInfoSuccess(id, data) {
  return {
    type: types.CHANGE_INFO_SUCCESS,
    meta: { entityName, id },
    payload: data,
  };
}

export function changeInfoFailure(id, error) {
  return {
    type: types.CHANGE_INFO_FAILURE,
    meta: { entityName, id },
    error: true,
    payload: error,
  };
}

export function changeInfo(id, payload) {
  return async (dispatch) => {
    dispatch(changeInfoRequest(id, payload));

    try {
      const data = await UserAPI.updateInfo(id, payload);
      dispatch(changeInfoSuccess(id, data));
    } catch (error) {
      dispatch(changeInfoFailure(id, error));
    }
  };
}

// Fetch user entity
export function fetchOne(id) {
  return async (dispatch) => {
    dispatch(entity.fetchOneRequest(entityName, id));

    try {
      const data = await UserAPI.get(id);
      dispatch(batchActions(
        entities.add(data),
        entity.fetchOneSuccess(entityName, id, data[entityName][id]),
      ));
    } catch (error) {
      dispatch(entity.fetchOneFailure(entityName, id, error));
    }
  };
}