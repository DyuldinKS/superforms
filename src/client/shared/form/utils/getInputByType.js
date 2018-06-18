import { constants } from './inputTypes';
import * as inputs from '../components/inputs';

const {
  DATE,
  NUMBER,
  SELECT,
  TEXT,
  TIME,
} = constants;

const match = {
  [DATE]: 'InputDate',
  [NUMBER]: 'InputNumber',
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
