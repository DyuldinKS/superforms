import * as types from './actionTypes';

const initialState = {
  userId: null,
  orgId: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case types.INIT:
      return handleInit(state, action);

    case types.UPDATE:
      return handleUpdate(state, action);

    default:
      return state;
  }
}

function handleInit(state, { payload }) {
  return {
    ...state,
    ...payload,
  };
}

function handleUpdate(state, { payload }) {
  return {
    ...state,
    ...payload,
  };
}
