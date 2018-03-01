import {
  NAME as listModuleName,
  reducer as listReducer,
} from './list';

const initialState = {
  // listId: listState
};

export default function (state = initialState, action) {
  if (action.type.slice(0, listModuleName.length) === listModuleName) {
    const { listId } = action.meta;
    const listState = state[listId];
    const newListState = listReducer(listState, action);

    if (newListState === listState) {
      return state;
    }

    return {
      ...state,
      [listId]: newListState,
    };
  }

  return state;
}
