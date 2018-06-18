export const constants = {
  ALL:       'all',
  ACTIVE:    'active',
  INACTIVE:  'inactive',
  UNSENT:    'unsent',
};

export const locales = {
  [constants.ALL]:       'Все',
  [constants.ACTIVE]:    'Активные',
  [constants.INACTIVE]:  'Завершенные',
  [constants.UNSENT]:    'В разработке',
};

export const defaultTab = constants.ACTIVE;

export default [
  {
    tab: constants.ACTIVE,
    label: locales[constants.ACTIVE],
    filters: { collecting: true, inactive: false },
  },
  {
    tab: constants.UNSENT,
    label: locales[constants.UNSENT],
    filters: { collecting: false },
  },
  {
    tab: constants.INACTIVE,
    label: locales[constants.INACTIVE],
    filters: { collecting: true, inactive: true },
  },
  {
    tab: constants.ALL,
    label: locales[constants.ALL],
    filters: {},
  },
];
