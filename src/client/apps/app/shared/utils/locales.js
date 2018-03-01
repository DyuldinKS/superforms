import locales from 'Locales/entities';

function getStatus(status) {
  return locales.status[status];
}

function getRole(role) {
  return locales.role[role];
}

export default {
  getStatus,
  getRole,
};
