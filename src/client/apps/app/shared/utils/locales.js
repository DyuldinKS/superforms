import locales from 'Locales/entities';

export function getActive(isActive) {
  return locales.active[String(isActive)];
}

export function getRole(role) {
  return locales.role[role];
}
