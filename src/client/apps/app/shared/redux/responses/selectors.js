import { selectors as entitySelectors } from 'shared/entities/entity';
import NAME from './constants';


export function getResponse(state, id) {
  return {
    entity: entitySelectors.getEntity(state, NAME, id),
    fetchStatus: entitySelectors.getFetchStatus(state, NAME, id),
    error: entitySelectors.getError(state, NAME, id),
  };
}

export function getEntity(state, id) {
  return entitySelectors.getEntity(state, NAME, id);
}

export function getItems(state, id) {
  return getResponse(state, id).items || {};
}
