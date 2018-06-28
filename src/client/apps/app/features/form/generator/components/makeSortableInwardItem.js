import { DragSource } from 'react-dnd';
import { SAMPLE } from '../utils/dndTypes';

const source = {
  beginDrag(props) {
    return {
      id: props.id,
    };
  },
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    draggable: monitor.canDrag(),
  };
}

export default function makeSortableInwardItem(Component) {
  return DragSource(SAMPLE, source, collect)(Component);
}
