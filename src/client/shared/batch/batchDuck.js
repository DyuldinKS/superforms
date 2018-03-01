// This files contains redux reducer enhancer to support redux actions batching

const BATCH_ACTIONS = 'BatchActions';

export function enhanceReducerWithBatch(reducer) {
  return function batchEnhancedReducer(state, action) {
    switch (action.type) {
      case BATCH_ACTIONS:
        return action.actions.reduce(batchEnhancedReducer, state);
      default:
        return reducer(state, action);
    }
  };
}

export function batchActions(...actions) {
  return {
    type: BATCH_ACTIONS,
    actions,
  };
}
