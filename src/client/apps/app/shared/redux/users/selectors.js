import { selectors as entitySelectors } from 'shared/entities/entity';
import { selectors as listSelectors } from 'shared/lists/list';
import NAME from './constants';
import { getFormsListId } from './utils';


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

export function getShortName(state, userId) {
  const {
    firstName,
    lastName,
    patronymic = '',
  } = getUserEntity(state, userId);

  const patro = patronymic.charAt(0)
    ? ` ${patronymic.charAt(0)}.`
    : '';

  return `${lastName} ${firstName.charAt(0)}.${patro}`;
}

export function getFormsList(state, userId) {
  return listSelectors.getList(state, getFormsListId(userId));
}
