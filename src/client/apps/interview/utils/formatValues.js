import { constants } from 'shared/form/utils/inputTypes';

export default function formatValues(items, values = {}) {
  const formatted = { ...values };

  Object.keys(values).forEach((inputId) => {
    const inputType = items[inputId].type;
    const value = values[inputId];

    if (inputType === constants.NUMBER) {
      const preformat = value.trim().replace(',', '.');
      const toNumber = Number(preformat);
      if (Number.isNaN(toNumber)) {
        throw new Error(`Ответ на вопрос "${items[inputId].title}" должен быть числом`);
      }

      formatted[inputId] = toNumber;
      return;
    }

    if (inputType === constants.SELECT) {
      if (value.other) {
        formatted[inputId].other = value.other.trim();
      }
      return;
    }

    if (typeof value === 'string') {
      formatted[inputId] = value.trim();
    }
  });

  return formatted;
}
