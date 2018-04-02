import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import { SAMPLE, BLOCK } from '../utils/dndTypes';
import { getSample } from '../utils/samples';
import FormItemSample from './FormItemSample';
import FormItemBlock from './FormItemBlock';

const propTypes = {
  addItem: PropTypes.func.isRequired,
  canDrop: PropTypes.bool,
  connectDropTarget: PropTypes.func.isRequired,
  dragItemId: PropTypes.string,
  dragItemType: PropTypes.string,
  findItem: PropTypes.func.isRequired,
  getItem: PropTypes.func.isRequired,
  inwardDragIndex: PropTypes.number,
  isOver: PropTypes.bool,
  order: PropTypes.array.isRequired,
  setInwardDragIndex: PropTypes.func.isRequired,
  swapItems: PropTypes.func.isRequired,
};

const defaultProps = {
  canDrop: false,
  dragItemId: null,
  dragItemType: null,
  inwardDragIndex: -1,
  isOver: false,
};

class SortableList extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.canDrop
      && nextProps.dragItemType === SAMPLE
      && this.props.isOver
      && !nextProps.isOver) {
      // when dragged SAMPLE leave container
      nextProps.setInwardDragIndex(-1);
    }
  }

  renderItems(items) {
    const {
      findItem,
      getItem,
      inwardDragIndex,
      setInwardDragIndex,
      swapItems,
    } = this.props;

    return items.map(itemId => (
      <FormItemBlock
        key={itemId}
        id={itemId}
        item={getItem(itemId)}
        inwardDragIndex={inwardDragIndex}
        findItem={findItem}
        swapItems={swapItems}
        setInwardDragIndex={setInwardDragIndex}
      />
    ));
  }

  render() {
    const {
      canDrop,
      connectDropTarget,
      dragItemId,
      inwardDragIndex,
      order,
    } = this.props;

    if (canDrop && dragItemId && inwardDragIndex > -1) {
      return connectDropTarget(
        <div className="form-generator-working-pane">
          {this.renderItems(order.slice(0, inwardDragIndex))}
          <FormItemSample
            id={dragItemId}
            key={dragItemId}
            item={getSample(dragItemId)}
            dragging
          />
          {this.renderItems(order.slice(inwardDragIndex))}
        </div>
      );
    }

    return connectDropTarget(
      <div className="form-generator-working-pane">
        {this.renderItems(order)}
      </div>
    );
  }
}

SortableList.propTypes = propTypes;
SortableList.defaultProps = defaultProps;

const allowedSources = [SAMPLE, BLOCK];

const target = {
  drop(props, monitor) {
    const { inwardDragIndex } = props;

    if (inwardDragIndex > -1) {
      const dragId = monitor.getItem().id;
      props.addItem(getSample(dragId), inwardDragIndex);
    }
  },
};

function collect(connect, monitor) {
  const item = monitor.getItem() || {};

  return {
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver(),
    dragItemId: item.id,
    dragItemType: monitor.getItemType(),
  };
}

export default DropTarget(allowedSources, target, collect)(SortableList);
