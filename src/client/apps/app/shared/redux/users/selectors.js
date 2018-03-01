import { selectors as entitySelectors } from 'shared/entities/entity';
import NAME from './constants';


export function getUser(state, userId) {
  return {
    entity: entitySelectors.getEntity(state, NAME, userId),
    fetchStatus: entitySelectors.getFetchStatus(state, NAME, userId),
    error: entitySelectors.getError(state, NAME, userId),
  };
}

export function getUserEntity(state, userId) {
  return entitySelectors.getEntity(state, NAME, userId);
}

export function getFullName(state, userId) {
  const {
    firstName,
    lastName,
    patronymic = '',
  } = getUserEntity(state, userId);

  return `${lastName} ${firstName} ${patronymic}`;
}
