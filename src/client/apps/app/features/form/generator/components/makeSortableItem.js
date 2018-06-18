import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import { BLOCK, SAMPLE } from '../utils/dndTypes';

const allowedSources = [BLOCK, SAMPLE];

const target = {
  drop() {},

  hover(props, monitor, component) {
    const dragId = monitor.getItem().id;
    const hoverId = props.id;

    if (dragId === hoverId) {
      return;
    }

    const hoverRect = findDOMNode(component).getBoundingClientRect();
    const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
    const clientOffset = monitor.getClientOffset();
    const hoverClientY = clientOffset.y - hoverRect.top;

    const dragIndex = props.getDragIndex();
    const hoverIndex = props.findItem(hoverId);
    const dragType = monitor.getItemType();
    let trueHoverIndex = hoverIndex;

    if (dragType === BLOCK) {
      // Imitate that dragged item pulled from array
      const pullIndex = monitor.getItem().index;

      if (hoverIndex > pullIndex) {
        trueHoverIndex = hoverIndex - 1;
      }
    }

    if (dragIndex > -1) {
      // Not crossed lower half of right sibling
      if (dragIndex === trueHoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Not crossed lower half of left sibling
      if (dragIndex - 1 === trueHoverIndex && hoverClientY >= hoverMiddleY) {
        return;
      }
    }

    if (hoverClientY >= hoverMiddleY) {
      props.setDragIndex(trueHoverIndex + 1);
    } else {
      props.setDragIndex(trueHoverIndex);
    }
  },
};

function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
  };
}

const source = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.findItem(props.id),
    };
  },

  isDragging(props, monitor) {
    return props.id === monitor.getItem().id;
  },
};

function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    draggable: monitor.canDrag(),
    dragging: monitor.isDragging(),
  };
}

export default function makeSortableItem(Component) {
  const Draggable = DragSource(BLOCK, source, collectSource)(Component);
  return DropTarget(allowedSources, target, collectTarget)(Draggable);
}
