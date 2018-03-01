import getPartsFromURL from '../utils/getPartsFromURL';
import * as types from './actionTypes';

const initialState = {
  pathname: '',
  search: {},
  hash: '',
  stateObj: {},
};

const typesAsArray = Object.values(types);

export default function (state = initialState, action) {
  if (!typesAsArray.find(type => action.type === type)) {
    return state;
  }

  const {
    to,
    stateObj,
  } = action;

  if (typeof to === 'object') {
    return {
      ...initialState,
      ...to,
      stateObj,
    };
  }

  // If "to" is a string path then parse it
  const parts = getPartsFromURL(to);

  return {
    ...initialState,
    ...parts,
    stateObj,
  };
}
