import locales from 'Locales/entities';
import { constants as type } from 'shared/form/utils/inputTypes';
import ROLES from 'apps/app/shared/redux/users/roles';

const fields = {
  lastName: {
    title: 'Фамилия',
    type: type.TEXT,
    required: true,
  },
  firstName: {
    title: 'Имя',
    type: type.TEXT,
    required: true,
  },
  patronymic: {
    title: 'Отчество',
    type: type.TEXT,
  },
  email: {
    title: 'Электронная почта',
    type: type.TEXT,
    required: true,
  },
  role: {
    title: 'Роль',
    type: type.SELECT,
    required: true,
    options: Object.values(ROLES),
  },
  org: {
    title: 'Организация',
    type: type.TEXT,
    readOnly: true,
  },
};

export default fields;
