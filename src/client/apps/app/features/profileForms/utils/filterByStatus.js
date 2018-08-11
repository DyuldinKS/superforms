import Moment from 'moment';
import { constants } from './statusTabs';

export default function filterByStatus(list, status) {
  switch (status) {
    case constants.ACTIVE:
      return list.filter(item => (
        item.collecting
          && (!item.collecting.stop || Moment().isBefore(item.collecting.stop))
      ));

    case constants.INACTIVE:
      return list.filter(item => (
        item.collecting && item.collecting.stop
          && Moment().isAfter(item.collecting.stop)
      ));

    case constants.UNSENT:
      return list.filter(item => !item.collecting);

    default:
      return list;
  }
}
