import NAME from './constants';

export function getAffiliatedUsersListId(orgId) {
  return `${NAME}-${orgId}-users`;
}

export function getAffiliatedOrgsListId(orgId) {
  return `${NAME}-${orgId}-org`;
}
