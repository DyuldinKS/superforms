import { constants as inputTypes } from 'shared/form/utils/inputTypes';

const defaultTogglers = [
  { name: 'required', title: 'Обязательный' },
];


const numberTogglers = [
  { name: 'integer', title: 'Только целые числа' },
];

const selectTogglers = [
  { name: 'multiple', title: 'Несколько вариантов' },
  { name: 'optionOther', title: 'Свой вариант' },
];

const stringTogglers = [
  { name: 'textarea', title: 'Многострочный' },
];

export default function getTogglers(item) {
  let togglers = defaultTogglers.slice();

  switch (item.type) {
    case inputTypes.SELECT:
      togglers = togglers.concat(selectTogglers);
      break;

    case inputTypes.TEXT:
      togglers = togglers.concat(stringTogglers);
      break;

    case inputTypes.NUMBER:
      togglers = togglers.concat(numberTogglers);
      break;

    default:
      break;
  }

  return togglers;
}
