export const data = {
  title: 'Информация о средствах обеспечения учебной литературой обучающихся ОУ за март 2018 г. (Приложение 2)',
  type: 'monitoring',
  basis: 'Распоряжение',
  basisname: '№ 3548-р от 20.11.2017 г.',
  description: '',
  newAddition: 'bla bla bla',
  scheme: {
    items: {
      0: {
        _type: 'question',
        description: '(для "Морской школы" - 2)',
        title: 'Номер школы',
        type: 'integer',
        required: 'true',
        test: 'test'
      },
      1: {
        _type: 'delimeter',
        title: 'По целевой статье 0220020090 "Расходы на приобретение учебных изданий для комплектования библиотек образовательных учреждений'
      },
      2: {
        _type: 'question',
        description: '(в руб.)',
        title: 'Выделено',
        type: 'float',
        required: 'true',
        test: 'test'
      },
      3: {
        _type: 'question',
        description: '(в руб.)',
        title: 'Израсходовано',
        type: 'float',
        required: 'true',
        test: 'test'
      },
      4: {
        _type: 'delimeter',
        title: 'По целевой статье 0220020030 "Субсидии бюджетным учреждениям - общеобразовательным школам на финансовое обеспечение выполнения государственного задания»'
      },
      5: {
        _type: 'question',
        description: '(в руб.)',
        title: 'Выделено',
        type: 'float',
        required: 'true',
        test: 'test'
      },
      6: {
        _type: 'question',
        description: '(в руб.)',
        title: 'Израсходовано',
        type: 'float',
        required: 'true',
        test: 'test'
      },
      7: {
        _type: 'delimeter',
        title: 'По целевой статье 0220020040 "Субсидии автономным учреждениям - образовательным школам на финансовое обеспечение выполнения государственного задания"'
      },
      8: {
        _type: 'question',
        description: '(в руб.)',
        title: 'Выделено',
        type: 'float',
        required: 'true',
        test: 'test'
      },
      9: {
        _type: 'question',
        description: '(в руб.)',
        title: 'Израсходовано',
        type: 'float',
        required: 'true',
        test: 'test'
      },
      10: {
        _type: 'delimeter',
        title: 'Из других источников'
      },
      11: {
        _type: 'question',
        description: '(в руб.)',
        title: 'Выделено',
        type: 'float',
        required: 'true',
        test: 'test'
      },
      12: {
        _type: 'question',
        description: '(в руб.)',
        title: 'Израходовано',
        type: 'float',
        required: 'true',
        test: 'test'
      },
    },
    order: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
};
