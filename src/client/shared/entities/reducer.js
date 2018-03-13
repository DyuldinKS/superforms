import * as usersModule from 'apps/app/shared/redux/users';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import * as formsModule from 'apps/app/shared/redux/forms';
import * as types from './actionTypes';
import {
  NAME as entityModuleName,
  reducer as entityCommonReducer,
} from './entity';
import {
  handleFetchSuccess as entityHandleAdd,
  initialState as entityInitialState,
} from './entity/reducer';

const entityFeatureReducers = {
  [usersModule.NAME]: usersModule.reducer,
  [orgsModule.NAME]: orgsModule.reducer,
  [formsModule.NAME]: formsModule.reducer,
};

const initialState = {
  users: entityInitialState,
  orgs: entityInitialState,
  forms: entityInitialState,
};

export default function (state = initialState, action) {
  if (action.type.slice(0, entityModuleName.length) === entityModuleName) {
    // entity action
    const { entityName } = action.meta;
    const entityState = state[entityName];

    // pass through common reducer
    let nextState = entityCommonReducer(entityState, action);

    // pass through feature reducer
    const featureReducer = entityFeatureReducers[entityName] ||
      (s => s);
    nextState = featureReducer(nextState, action);

    if (nextState === entityState) {
      return state;
    }

    return {
      ...state,
      [entityName]: nextState,
    };
  }

  // entities action
  switch (action.type) {
    case types.ADD:
      return handleAdd(state, action);

    default:
      return state;
  }
}

function handleAdd(state, action) {
  const entitiesMap = action.payload || {};
  const entitiesNames = Object.keys(entitiesMap);

  if (entitiesNames.length === 0) {
    return state;
  }

  const updates = entitiesNames.reduce((acc, name) => {
    acc[name] = entityHandleAdd(state[name], { payload: entitiesMap[name] });
    return acc;
  }, {});

  return {
    ...state,
    ...updates,
  };
}
