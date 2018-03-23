import { inputTypes } from './constants';
import * as inputs from '../components/inputs';

const {
  DATE,
  NUMBER,
  PHONE,
  SELECT,
  TEXT,
  TIME,
} = inputTypes;

const match = {
  [DATE]: 'InputDate',
  [NUMBER]: 'InputNumber',
  [PHONE]: 'InputPhone',
  [SELECT]: 'InputSelect',
  [TEXT]: 'InputString',
  [TIME]: 'InputTime',
};

function NotFound() {
  console.error('Can\'t find matching component by provided type.');
  return null;
}

export default function getInputByType(type) {
  const name = match[type];
  return inputs[name] || NotFound;
}
