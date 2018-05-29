import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import { SAMPLE, BLOCK } from '../utils/dndTypes';
import getDefaultInputScheme from '../utils/getDefaultInputScheme';
import InsertPreview from './InsertPreview';
import InputItem from './InputItem';
import InsertZone from './InsertZone';

const propTypes = {
  order: PropTypes.array.isRequired,
  selectedItem: PropTypes.string,
  // form DnD
  canDrop: PropTypes.bool,
  connectDropTarget: PropTypes.func.isRequired,
  dragItemId: PropTypes.string,
  dragItemType: PropTypes.string,
  dragInitialIndex: PropTypes.number,
  isOver: PropTypes.bool,
};

const defaultProps = {
  selectedItem: null,
  // from DnD
  canDrop: false,
  dragItemId: null,
  dragItemType: null,
  dragInitialIndex: -1,
  isOver: false,
};

const contextTypes = {
  addItem: PropTypes.func.isRequired,
  duplicateItem: PropTypes.func.isRequired,
  findItem: PropTypes.func.isRequired,
  getItem: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  reorderItem: PropTypes.func.isRequired,
  selectItem: PropTypes.func.isRequired,
};

class SortableList extends Component {
  constructor(props) {
    super(props);

    this.state = { dragIndex: -1 };

    this.getDragIndex = this.getDragIndex.bind(this);
    this.setDragIndex = this.setDragIndex.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.canDrop
      && this.props.isOver
      && !nextProps.isOver) {
      // when dragged SAMPLE or BLOCK leave container
      this.setDragIndex(-1);
    }
  }

  getDragIndex() {
    return this.state.dragIndex;
  }

  setDragIndex(index = -1) {
    this.setState(() => ({
      dragIndex: index,
    }));
  }

  isReordering() {
    return this.props.dragItemType === BLOCK
      && this.state.dragIndex > -1;
  }

  renderItems(items) {
    const {
      duplicateItem,
      findItem,
      getItem,
      removeItem,
      selectItem,
    } = this.context;
    const { selectedItem } = this.props;
    const reordering = this.isReordering();

    return items.map(itemId => (
      <InputItem
        key={itemId}
        id={itemId}
        index={findItem(itemId) + 1}
        item={getItem(itemId)}
        onSelect={selectItem}
        onDuplicate={duplicateItem}
        onRemove={removeItem}
        reordering={reordering}
        selected={selectedItem === itemId}
        // for DnD
        findItem={findItem}
        getDragIndex={this.getDragIndex}
        setDragIndex={this.setDragIndex}
      />
    ));
  }

  renderList() {
    const {
      canDrop,
      dragItemId,
      dragInitialIndex,
      dragItemType,
      order,
    } = this.props;
    const { dragIndex } = this.state;

    if (canDrop && dragItemId && dragIndex > -1) {
      let sliceIndex = dragIndex;
      if (dragItemType === BLOCK && dragIndex >= dragInitialIndex) {
        // Imitate that dragged item pulled from array
        sliceIndex = dragIndex + 1;
      }

      return (
        <React.Fragment>
          {this.renderItems(order.slice(0, sliceIndex))}
          <InsertPreview
            id={dragItemId}
            type={dragItemType}
          />
          {this.renderItems(order.slice(sliceIndex))}
        </React.Fragment>
      );
    }

    return this.renderItems(order);
  }

  render() {
    const {
      connectDropTarget,
      order,
    } = this.props;

    return connectDropTarget(
      <div className="form-generator-items-list">
        {this.renderList()}

        {
          this.state.dragIndex > -1
          ? null
          : <InsertZone
            insertIndex={order.length}
            getDragIndex={this.getDragIndex}
            setDragIndex={this.setDragIndex}
          />
        }
      </div>
    );
  }
}

SortableList.propTypes = propTypes;
SortableList.defaultProps = defaultProps;
SortableList.contextTypes = contextTypes;

const allowedSources = [SAMPLE, BLOCK];

const target = {
  drop(props, monitor, component) {
    const { dragIndex } = component.state;

    if (dragIndex < 0) {
      return;
    }

    const dragId = monitor.getItem().id;
    const dragType = monitor.getItemType();
    const { addItem, reorderItem } = component.context;

    if (dragType === SAMPLE) {
      addItem(getDefaultInputScheme(dragId), dragIndex);
    } else {
      const initialIndex = monitor.getItem().index;
      if (initialIndex !== dragIndex) {
        reorderItem(dragId, dragIndex);
      }
    }

    component.setDragIndex(-1);
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
    dragInitialIndex: item.index,
  };
}

export default DropTarget(allowedSources, target, collect)(SortableList);
