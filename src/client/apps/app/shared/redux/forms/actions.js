import { actions as entity } from 'shared/entities/entity';
import { actions as entities } from 'shared/entities';
import { batchActions } from 'shared/batch';
import { FormAPI } from 'api/';
import entityName from './constants';
// import * as types from './actionTypes';

// Fetch form entity
export function fetch(id) {
  return async (dispatch) => {
    dispatch(entity.fetchOneRequest(entityName, id));

    try {
      const data = await FormAPI.get(id);
      dispatch(entity.fetchOneSuccess(entityName, id, data));
    } catch (error) {
      dispatch(entity.fetchOneFailure(entityName, id, error));
    }
  };
}
