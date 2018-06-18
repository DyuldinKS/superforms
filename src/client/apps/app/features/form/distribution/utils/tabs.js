export const constants = {
  LINK:      'link',
  QR:        'qr',
  EMAIL:     'email',
  SETTINGS:  'settings',
};

export const locales = {
  [constants.LINK]:      'Ссылка',
  [constants.QR]:        'QR-код',
  [constants.EMAIL]:     'Email рассылка',
  [constants.SETTINGS]:  'Настройки',
};

export const defaultTab = constants.LINK;

export default [
  {
    tab: constants.LINK,
    label: locales[constants.LINK],
  },
  // {
  //   tab: constants.QR,
  //   label: locales[constants.QR],
  // },
  // {
  //   tab: constants.EMAIL,
  //   label: locales[constants.EMAIL],
  // },
  {
    tab: constants.SETTINGS,
    label: locales[constants.SETTINGS],
  },
];
