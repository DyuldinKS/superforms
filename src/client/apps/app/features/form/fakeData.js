const number = {
  _type: 'question',
  title: 'Любое число',
  type: 'number',
  required: true,
  min: 0,
  max: 15,
};

const integer = {
  _type: 'question',
  title: 'Целое число',
  type: 'number',
  required: true,
  integer: true,
  min: 0,
  max: 15,
};

const string = {
  _type: 'question',
  title: 'Строка',
  type: 'text',
  required: true,
  maxLength: 25,
};

const phone = {
  _type: 'question',
  title: 'Телефон',
  type: 'phone',
  required: true,
};

const textarea = {
  _type: 'question',
  textarea: true,
  title: 'Текст',
  type: 'text',
  required: true,
  maxLength: 25,
};

const select = {
  _type: 'question',
  title: 'Выбор из списка',
  type: 'select',
  options: [
    'Cookie',
    'Banana',
    'Ice-cream',
  ],
  optionOther: true,
  required: true,
};

const selectMulti = {
  _type: 'question',
  title: 'Несколько из списка',
  type: 'select',
  multiple: true,
  options: [
    'Cookie',
    'Banana',
    'Ice-cream',
  ],
  optionOther: true,
  required: true,
};

const date = {
  _type: 'question',
  title: 'Дата',
  type: 'date',
  required: true,
};

const time = {
  _type: 'question',
  title: 'Время',
  type: 'time',
  required: true,
};

const scheme = {
  order: ['number', 'integer', 'string', 'textarea', 'select', 'selectMulti', 'date', 'time'],
  items: {
    number,
    integer,
    string,
    select,
    selectMulti,
    date,
    time,
    textarea,
  },
};

export const data = {
  scheme,
};
