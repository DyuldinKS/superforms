import { selectors as entitySelectors } from 'shared/entities/entity';
import NAME from './constants';


export function getForm(state, formId) {
  return {
    entity: entitySelectors.getEntity(state, NAME, formId),
    fetchStatus: entitySelectors.getFetchStatus(state, NAME, formId),
    error: entitySelectors.getError(state, NAME, formId),
  };
}

export function getFormEntity(state, formId) {
  return entitySelectors.getEntity(state, NAME, formId);
}

export function getScheme(state, formId) {
  return getFormEntity(state, formId).scheme || {};
}

export function getItems(state, formId) {
  return getScheme(state, formId).items || {};
}

export function getItemsOrder(state, formId) {
  return getScheme(state, formId).order || [];
}

export function getItem(state, formId, itemId) {
  return getItems(state, formId)[itemId] || {};
}

export function getCollectingSettings(state, formId) {
  return getFormEntity(state, formId).collecting;
}
