import * as types from './actionTypes';
import { batchActions as batch } from 'shared/batch';
import { actions as entitiesActions } from 'shared/entities';

function setCredentials(userId, orgId) {
  return {
    type: types.SET_CREDENTIALS,
    payload: {
      userId,
      orgId,
    },
  };
}

export function init(userId, orgId, user, org) {
  return (dispatch) => {
    const entitiesMap = {
      users: user,
      orgs: org,
    };

    dispatch(
      batch(
        setCredentials(userId, orgId),
        entitiesActions.add(entitiesMap),
      ),
    );
  };
}
