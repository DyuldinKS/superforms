import { constants } from 'shared/form/utils/inputTypes';

const inputTypes = Object.values(constants);

export default function getDefaultInputScheme(inputType) {
  const type = inputTypes.includes(inputType)
    ? inputType
    : inputTypes.TEXT;

  return {
    itemType: 'input',
    title: 'Новый вопрос',
    type,
  };
}
