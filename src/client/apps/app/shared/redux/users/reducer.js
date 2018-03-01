import { initialState } from 'shared/entities/entity/reducer';
import * as types from './actionTypes';


export default function (state = initialState, action) {
  switch (action.type) {
    case types.CHANGE_STATUS_REQUEST:
    case types.CHANGE_ROLE_REQUEST:
    case types.CHANGE_EMAIL_REQUEST:
    case types.CHANGE_INFO_REQUEST:
      return handleUpdateRequest(state, action);

    case types.CHANGE_STATUS_SUCCESS:
    case types.CHANGE_ROLE_SUCCESS:
    case types.CHANGE_EMAIL_SUCCESS:
    case types.CHANGE_INFO_SUCCESS:
      return handleUpdateSuccess(state, action);

    case types.CHANGE_STATUS_FAILURE:
    case types.CHANGE_ROLE_FAILURE:
    case types.CHANGE_EMAIL_FAILURE:
    case types.CHANGE_INFO_FAILURE:
      return handleUpdateFailure(state, action);

    default:
      return state;
  }
}

function handleUpdateRequest(state) {
  return state;
}

function handleUpdateSuccess(state, action) {
  const { id } = action.meta;
  const entity = state.entities[id] || {};

  return {
    fetchStatus: state.fetchStatus,
    errors: state.errors,
    entities: {
      ...state.entities,
      [id]: {
        ...entity,
        ...action.payload,
      },
    },
  };
}

function handleUpdateFailure(state) {
  return state;
}

