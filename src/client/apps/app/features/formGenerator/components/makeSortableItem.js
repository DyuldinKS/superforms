import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import { BLOCK, SAMPLE } from '../utils/dndTypes';

const allowedSources = [BLOCK, SAMPLE];

const target = {
  drop() {},

  hover(props, monitor, component) {
    const dragId = monitor.getItem().id;
    const hoverId = props.id;
    const dragIndex = props.findItem(dragId);
    const hoverIndex = props.findItem(hoverId);
    const type = monitor.getItemType();

    if (dragId === hoverId) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    if (type === SAMPLE) {
      const inwardDragIndex = props.getInwardDragIndex();

      if ((inwardDragIndex < 0 || inwardDragIndex <= hoverIndex)
        && hoverClientY >= hoverMiddleY) {
        props.setInwardDragIndex(hoverIndex + 1);
        return;
      }

      if ((inwardDragIndex < 0 || inwardDragIndex > hoverIndex)
        && hoverClientY <= hoverMiddleY) {
        props.setInwardDragIndex(hoverIndex);
        return;
      }

      return;
    }

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    props.swapItems(dragIndex, hoverIndex);
  },
};

function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

const source = {
  beginDrag(props) {
    return {
      id: props.id,
    };
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

