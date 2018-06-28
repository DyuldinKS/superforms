import * as types from './actionTypes';

const initialState = {
  userId: null,
  orgId: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case types.SET_CREDENTIALS:
      return handleSetCredentials(state, action);

    default:
      return state;
  }
}

function handleSetCredentials(state, { payload }) {
  return {
    ...state,
    ...payload,
  };
}
