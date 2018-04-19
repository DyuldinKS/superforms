import { initialState } from 'shared/entities/entity/reducer';
import * as types from './actionTypes';

export default function (state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_REQUEST:
      return handleUpdateRequest(state, action);

    case types.UPDATE_SUCCESS:
      return handleUpdateSuccess(state, action);

    case types.UPDATE_FAILURE:
      return handleUpdateFailure(state, action);

    default:
      return state;
  }
}

function handleUpdateRequest(state, action) {
  const { id } = action.meta;
  const entity = state.entities[id] || {};

  return {
    fetchStatus: state.fetchStatus,
    errors: state.errors,
    entities: {
      ...state.entities,
      [id]: {
        ...entity,
        updating: true,
      },
    },
  };
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
        updating: false,
        ...action.payload,
      },
    },
  };
}

function handleUpdateFailure(state, action) {
  return state;
}
