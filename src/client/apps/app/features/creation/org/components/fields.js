import { constants as type } from 'shared/form/utils/inputTypes';

const fields = {
  fullName: {
    title: 'Полное наименование',
    type: type.TEXT,
    textarea: true,
    required: true,
  },
  label: {
    title: 'Краткое наименование',
    description: 'Наименование для отображения в системе',
    type: type.TEXT,
    required: true,
  },
  email: {
    title: 'Электронная почта',
    type: type.TEXT,
    required: true,
  },
  org: {
    title: 'Надведомственная организация',
    type: type.TEXT,
    readOnly: true,
  },
};

export default fields;
