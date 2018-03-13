import { initialState } from 'shared/entities/entity/reducer';
import { data } from './fakeData';

const id = 'fake';
initialState.entities[id] = data;
initialState.fetchStatus[id] = 'loaded';

export default function (state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
