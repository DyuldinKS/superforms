import { initialState } from 'shared/entities/entity/reducer';
import * as types from './actionTypes';

export default function (state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_REQUEST:
    case types.UPDATE_SUCCESS:
    case types.UPDATE_FAILURE:
      return handleUpdate(state, action);

    case types.FETCH_RESPONSES_REQUEST:
    case types.FETCH_RESPONSES_SUCCESS:
    case types.FETCH_RESPONSES_FAILURE:
      return handleFetchResponses(state, action);

    default:
      return state;
  }
}

function handleUpdate(state, action) {
  const { id } = action.meta;
  const entity = state.entities[id] || {};
  let nextEntity = { ...entity };

  switch (action.type) {
    case types.UPDATE_REQUEST:
      nextEntity.updating = true;
      break;

    case types.UPDATE_FAILURE:
      break;

    case types.UPDATE_SUCCESS:
      nextEntity.updating = false;
      nextEntity = { ...nextEntity, ...action.payload };
      break;

    default:
      return state;
  }

  return {
    fetchStatus: state.fetchStatus,
    errors: state.errors,
    entities: {
      ...state.entities,
      [id]: nextEntity,
    },
  };
}

function handleFetchResponses(state, action) {
  const { id } = action.meta;
  const entity = state.entities[id] || {};
  const responses = entity.responses || {};

  const nextResponses = { ...responses };

  switch (action.type) {
    case types.FETCH_RESPONSES_REQUEST:
      nextResponses.fetching = true;
      delete nextResponses.fetchError;
      break;

    case types.FETCH_RESPONSES_FAILURE:
      nextResponses.fetching = false;
      nextResponses.fetchError = action.payload;
      break;

    case types.FETCH_RESPONSES_SUCCESS:
      nextResponses.fetching = false;
      delete nextResponses.fetchError;
      nextResponses.list = action.payload;
      break;

    default:
      return state;
  }

  return {
    fetchStatus: state.fetchStatus,
    errors: state.errors,
    entities: {
      ...state.entities,
      [id]: {
        ...entity,
        responses: nextResponses,
      },
    },
  };
}
