// Primary reducer for the app.
// All reducers neeed to be rolled up to this parent.

import { combineReducers } from 'redux';
import { enhanceReducerWithBatch } from 'shared/batch';

import * as entities from 'shared/entities';
import * as lists from 'shared/lists';
import * as router from 'shared/router/redux';
import * as session from '../shared/redux/session';

const reducer = combineReducers({
  [session.NAME]: session.reducer,
  [router.NAME]: router.reducer,
  [entities.NAME]: entities.reducer,
  [lists.NAME]: lists.reducer,
});

export default enhanceReducerWithBatch(reducer);
