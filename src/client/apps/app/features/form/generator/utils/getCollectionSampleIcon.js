import { constants as types } from 'shared/form/utils/inputTypes';

export default function getCollectionSampleIcon(type) {
  switch (type) {
    case types.NUMBER:
      return 'fas fa-hashtag';

    case types.SELECT:
      return 'far fa-check-square';

    case types.DATE:
      return 'far fa-calendar';

    case types.TIME:
      return 'far fa-clock';

    default:
      return 'fas fa-font';
  }
}
