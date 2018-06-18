import { actions as entity } from 'shared/entities/entity';
import { ResponseAPI } from 'api/';
import entityName from './constants';

// Fetch response
export function fetch(id) {
  return async (dispatch) => {
    dispatch(entity.fetchOneRequest(entityName, id));

    try {
      const data = await ResponseAPI.get(id);
      dispatch(entity.fetchOneSuccess(entityName, id, data));
    } catch (error) {
      dispatch(entity.fetchOneFailure(entityName, id, error));
    }
  };
}
