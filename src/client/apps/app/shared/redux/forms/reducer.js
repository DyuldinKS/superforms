import { initialState } from 'shared/entities/entity/reducer';
import * as types from './actionTypes';

export default function (state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
