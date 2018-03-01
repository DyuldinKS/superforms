// import { init } from 'Lib/defaultRequest';
// import NetworkError from 'Lib/NetworkError';
import * as types from './actionTypes';

export function fetchOneRequest(entityName, entityId) {
  return {
    type: types.FETCH_ONE_REQUEST,
    meta: { entityName, entityId },
  };
}

export function fetchOneSuccess(entityName, entityId, data) {
  return {
    type: types.FETCH_ONE_SUCCESS,
    meta: { entityName, entityId },
    payload: data,
  };
}

export function fetchOneFailure(entityName, entityId, error) {
  return {
    type: types.FETCH_ONE_FAILURE,
    meta: { entityName, entityId },
    error: true,
    payload: error,
  };
}

// export function fetchOne(uri, entityName, entityId) {
//   return async (dispatch) => {
//     dispatch(fetchOneRequest(entityName, entityId));

//     try {
//       const response = await fetch(uri, init);

//       if (!response.ok) {
//         throw new NetworkError(response);
//       }

//       const data = await response.json();

//       dispatch(fetchOneSuccess(entityName, entityId, data));
//     } catch (error) {
//       dispatch(fetchOneFailure(entityName, entityId, error));
//     }
//   };
// }
