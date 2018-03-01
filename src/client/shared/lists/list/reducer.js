import * as types from './actionTypes';

const fetchStatuses = {
  REQUEST: 'loading',
  SUCCESS: 'loaded',
  FAILURE: 'failure',
};

export const initialState = {
  entries: [],
  fetchStatus: fetchStatuses.REQUEST,
  error: null,
  search: undefined,
  filters: undefined,
  selected: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case types.FETCH_REQUEST:
      return handleFetchRequest(state, action);

    case types.FETCH_SUCCESS:
      return handleFetchSuccess(state, action);

    case types.FETCH_FAILURE:
      return handleFetchFailure(state, action);

    case types.SELECT_ENTRY:
      return handleEntrySelect(state, action);

    case types.UNSELECT_ENTRY:
      return handleEntryUnselect(state, action);

    default:
      return state;
  }
}

function handleFetchRequest(state, { payload }) {
  return {
    ...state,
    fetchStatus: fetchStatuses.REQUEST,
    error: null,
    ...payload,
  };
}

function handleFetchSuccess(state, { payload }) {
  return {
    ...state,
    ...payload,
    fetchStatus: fetchStatuses.SUCCESS,
    error: null,
  };
}

function handleFetchFailure(state, action) {
  return {
    ...state,
    fetchStatus: fetchStatuses.FAILURE,
    error: {
      name: action.payload.name,
      message: action.payload.message,
    },
  };
}

function handleEntrySelect(state, action) {
  return {
    ...state,
    selected: {
      ...state.selected,
      [action.payload.entryId]: true,
    },
  };
}

function handleEntryUnselect(state, action) {
  const { entryId } = action.payload;
  const nextSelected = { ...state.selected };
  delete nextSelected[entryId];

  return {
    ...state,
    selected: nextSelected,
  };
}
