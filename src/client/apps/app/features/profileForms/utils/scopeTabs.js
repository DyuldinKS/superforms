export const constants = {
  USER:  'user',
  ORG:   'org',
};

export const locales = {
  [constants.USER]:   'Персональные',
  [constants.ORG]:    'Корпоративные',
};

export const defaultTab = constants.USER;

export default [
  {
    tab: constants.USER,
    label: locales[constants.USER],
  },
  {
    tab: constants.ORG,
    label: locales[constants.ORG],
  },
];
