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

const getLink = id => `/org/${id}`;

export function getBreadcrumb(state, fromId, toId) {
  const breadcrumb = [];

  // go up by the tree from toId to fromId
  let cursor = getOrgEntity(state, toId);
  while (Object.keys(cursor).length > 0 && cursor.id !== fromId) {
    const { label, parentId } = cursor;
    breadcrumb.push({ label, link: getLink(cursor.id) });
    cursor = getOrgEntity(state, parentId);
  }

  // if found gap between tree nodes
  if (cursor.id !== fromId) {
    breadcrumb.push({ label: '...' });
  }

  // add session org
  breadcrumb.push({
    label: 'Ваша организация',
    link: getLink(fromId),
  });

  return breadcrumb.reverse();
}
