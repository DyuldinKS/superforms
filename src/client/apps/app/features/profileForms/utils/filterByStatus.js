import Moment from 'moment';
import { constants } from './statusTabs';

export default function filterByStatus(list, status) {
  switch (status) {
    case constants.ACTIVE:
      return list.filter(item => item.collecting
        && !item.collecting.inactive
        && (!item.collecting.expires || Moment().isBefore(item.collecting.expires)));

    case constants.INACTIVE:
      return list.filter(item => item.collecting
        && (!!item.collecting.inactive || Moment().isAfter(item.collecting.expires)));

    case constants.UNSENT:
      return list.filter(item => !item.collecting);

    default:
      return list;
  }
}
