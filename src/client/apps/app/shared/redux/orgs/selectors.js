import { selectors as entitySelectors } from 'shared/entities/entity';
import { selectors as listSelectors } from 'shared/lists/list';
import NAME from './constants';
import * as utils from './utils';


export function getOrg(state, orgId) {
  return {
    entity: entitySelectors.getEntity(state, NAME, orgId),
    fetchStatus: entitySelectors.getFetchStatus(state, NAME, orgId),
    error: entitySelectors.getError(state, NAME, orgId),
  };
}

export function getOrgEntity(state, orgId) {
  return entitySelectors.getEntity(state, NAME, orgId);
}

export function getAffiliatedOrgsList(state, orgId) {
  return listSelectors.getList(state, utils.getAffiliatedOrgsListId(orgId));
}

export function getAffiliatedUsersList(state, orgId) {
  return listSelectors.getList(state, utils.getAffiliatedUsersListId(orgId));
}

export function getFormsList(state, orgId) {
  return listSelectors.getList(state, utils.getFormsListId(orgId));
}
