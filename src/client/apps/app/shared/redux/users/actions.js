import { actions as list } from 'shared/lists/list';
import * as listModule from 'shared/lists/list';
import { actions as entity } from 'shared/entities/entity';
import { actions as entities } from 'shared/entities';
import { actions as router } from 'shared/router/redux';
import { batchActions } from 'shared/batch';
import { UserAPI, RecipientAPI } from 'api/';
import entityName from './constants';
import * as types from './actionTypes';
import { getFormsListId } from './utils';

// Create
export function createRequest(parentId, payload) {
  return {
    type: types.CREATE_REQUEST,
    meta: { entityName, parentId },
    payload,
  };
}

export function createSuccess(parentId, payload) {
  return {
    type: types.CREATE_SUCCESS,
    meta: { entityName, parentId },
    payload,
  };
}

export function createFailure(parentId, error) {
  return {
    type: types.CREATE_FAILURE,
    meta: { entityName, parentId },
    error: true,
    payload: error,
  };
}

export function create(parentId, payload) {
  return async (dispatch) => {
    dispatch(createRequest(parentId, payload));

    try {
      const data = await UserAPI.create(parentId, payload);
      const createdId = data.id;

      dispatch(batchActions(
        createSuccess(parentId, data),
        entity.fetchOneSuccess(entityName, createdId, data),
        router.replace(`/user/${createdId}`),
      ));

      return {};
    } catch (error) {
      return dispatch(createFailure(parentId, error));
    }
  };
}

// Change status
export function changeStatusRequest(id, active) {
  return {
    type: types.CHANGE_STATUS_REQUEST,
    meta: { entityName, id },
    payload: { active },
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

export function changeStatus(id, active) {
  return async (dispatch) => {
    dispatch(changeStatusRequest(id, active));

    try {
      const data = await RecipientAPI.setActive(id, active);
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

// Fetch forms by user
export function fetchForms(userId, options) {
  return async (dispatch) => {
    const listId = getFormsListId(userId);
    dispatch(list.fetchRequest(listId, options));

    try {
      const data = await UserAPI.getForms(userId, options);

      dispatch(batchActions(
        entities.add(data.entities),
        list.fetchSuccess(listId, data.list),
      ));
    } catch (error) {
      dispatch(list.fetchFailure(listId, error));
    }
  };
}

// Fetch forms by user that takes options from state
export function fetchFormsNew(userId) {
  return async (dispatch, getState) => {
    const listId = getFormsListId(userId);
    const { search } = listModule.selectors.getList(getState(), listId);
    const options = { search };
    dispatch(list.fetchRequest(listId, options));

    try {
      const data = await UserAPI.getForms(userId, options);

      dispatch(batchActions(
        entities.add(data.entities),
        list.fetchSuccess(listId, data.list),
      ));
    } catch (error) {
      dispatch(list.fetchFailure(listId, error));
    }
  };
}
