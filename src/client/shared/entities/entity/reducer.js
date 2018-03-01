import * as types from './actionTypes';

const fetchStatuses = {
  REQUEST: 'loading',
  SUCCESS: 'loaded',
  FAILURE: 'failure',
};

export const initialState = {
  entities: {},
  fetchStatus: {},
  errors: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case types.FETCH_ONE_REQUEST:
      return handleFetchOneRequest(state, action);

    case types.FETCH_ONE_SUCCESS:
      return handleFetchOneSuccess(state, action);

    case types.FETCH_ONE_FAILURE:
      return handleFetchOneFailure(state, action);

    default:
      return state;
  }
}

function handleFetchOneRequest(state, action) {
  const { entityId } = action.meta;

  return {
    entities: state.entities,
    fetchStatus: {
      ...state.fetchStatus,
      [entityId]: fetchStatuses.REQUEST,
    },
    errors: removeError(state.errors, [entityId]),
  };
}

function handleFetchOneSuccess(state, action) {
  const { entityId } = action.meta;

  return {
    entities: {
      ...state.entities,
      [entityId]: action.payload,
    },
    fetchStatus: {
      ...state.fetchStatus,
      [entityId]: fetchStatuses.SUCCESS,
    },
    errors: removeError(state.errors, [entityId]),
  };
}

function removeError(errorState, entitiesIds) {
  const newErrorState = Object.assign({}, errorState);

  entitiesIds.forEach((id) => {
    delete newErrorState[id];
  });

  return newErrorState;
}

function handleFetchOneFailure(state, action) {
  const { entityId } = action.meta;

  return {
    entities: state.entities,
    fetchStatus: {
      ...state.fetchStatus,
      [entityId]: fetchStatuses.FAILURE,
    },
    errors: {
      ...state.errors,
      [entityId]: {
        name: action.payload.name,
        message: action.payload.message,
      },
    },
  };
}

export function handleFetchSuccess(state = initialState, action) {
  const entitiesMap = action.payload || {};
  const entitiesIds = Object.keys(entitiesMap);

  const newFetchStatuses = entitiesIds.reduce((acc, id) => {
    acc[id] = fetchStatuses.SUCCESS;
    return acc;
  }, {});

  return {
    entities: {
      ...state.entities,
      ...entitiesMap,
    },
    fetchStatus: {
      ...state.fetchStatus,
      ...newFetchStatuses,
    },
    errors: removeError(state.errors, entitiesIds),
  };
}
