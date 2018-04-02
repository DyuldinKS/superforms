const samplesMap = {
  a: {
    name: 'Короткий ответ',
  },
  b: {
    name: 'Число',
  },
  c: {
    name: 'Выбор из списка',
  },
  d: {
    name: 'Время',
  },
  e: {
    name: 'Дата',
  },
};

export const samples = ['a', 'b', 'c', 'd', 'e'];

export function getSample(id) {
  return samplesMap[id];
};
