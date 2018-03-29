import React from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import uuidv1 from 'uuid/v1';

const propTypes = {};

const defaultProps = {};

const bbSource = {
  beginDrag(props) {
    let { item } = props;
    if (!item.id) {
      item = {
        ...item,
        id: uuidv1().slice(0, 4),
      };
    }

    return {
      item,
      originalIndex: props.findItem(item.id).index,
    };
  },

  endDrag(props, monitor) {
    const { item, originalIndex } = monitor.getItem();
    const didDrop = monitor.didDrop();

    if (!didDrop) {
      if (originalIndex < 0) {
        props.removeItem(item.id);
      } else {
        props.moveItem(item, originalIndex);
      }
    }
  },
};

function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

const bbTarget = {
  canDrop() {
    return false;
  },

  hover(props, monitor) {
    const { item } = monitor.getItem();
    const { id: draggedId } = item;
    const { item: entry } = props;
    const { id: overId } = entry;

    if (draggedId !== overId) {
      const { index: overIndex } = props.findItem(overId);
      props.moveItem(item, overIndex);
    }
  },
};

function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
  };
}

function BuildingBlock(props) {
  const {
    item,
    connectDragSource,
    connectDropTarget,
    isDragging,
  } = props;

  return connectDragSource(
    connectDropTarget(
      <div
        className="building-block"
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        {item.name}
      </div>
    )
  );
}

BuildingBlock.propTypes = propTypes;
BuildingBlock.defaultProps = defaultProps;

export default DropTarget('BuildingBlock', bbTarget, collectTarget)(DragSource('BuildingBlock', bbSource, collectSource)(BuildingBlock));
