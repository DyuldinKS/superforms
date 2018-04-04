import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import { SAMPLE, BLOCK } from '../utils/dndTypes';
import getDefaultInputScheme from '../utils/getDefaultInputScheme';
import { locales as inputTypeLocales} from 'shared/form/utils/inputTypes';
import CollectionSample from './CollectionSample';
import InputItem from './InputItem';

const propTypes = {
  order: PropTypes.array.isRequired,
  // form DnD
  canDrop: PropTypes.bool,
  connectDropTarget: PropTypes.func.isRequired,
  dragItemId: PropTypes.string,
  dragItemType: PropTypes.string,
  isOver: PropTypes.bool,
};

const defaultProps = {
  canDrop: false,
  dragItemId: null,
  dragItemType: null,
  isOver: false,
};

const contextTypes = {
  addItem: PropTypes.func.isRequired,
  duplicateItem: PropTypes.func.isRequired,
  findItem: PropTypes.func.isRequired,
  getItem: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  selectItem: PropTypes.func.isRequired,
  swapItems: PropTypes.func.isRequired,
};

class SortableList extends Component {
  constructor(props) {
    super(props);

    this.state = { inwardDragIndex: -1 };

    this.getInwardDragIndex = this.getInwardDragIndex.bind(this);
    this.setInwardDragIndex = this.setInwardDragIndex.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.canDrop
      && nextProps.dragItemType === SAMPLE
      && this.props.isOver
      && !nextProps.isOver) {
      // when dragged SAMPLE leave container
      this.setInwardDragIndex(-1);
    }
  }

  getInwardDragIndex() {
    return this.state.inwardDragIndex;
  }

  setInwardDragIndex(index = -1) {
    this.setState(() => ({
      inwardDragIndex: index,
    }));
  }

  renderItems(items) {
    const {
      duplicateItem,
      findItem,
      getItem,
      removeItem,
      selectItem,
      swapItems,
    } = this.context;

    return items.map(itemId => (
      <InputItem
        key={itemId}
        id={itemId}
        index={findItem(itemId) + 1}
        item={getItem(itemId)}
        findItem={findItem}
        swapItems={swapItems}
        onSelect={selectItem}
        onDuplicate={duplicateItem}
        onRemove={removeItem}
        getInwardDragIndex={this.getInwardDragIndex}
        setInwardDragIndex={this.setInwardDragIndex}
      />
    ));
  }

  render() {
    const {
      canDrop,
      connectDropTarget,
      dragItemId,
      order,
    } = this.props;
    const { inwardDragIndex } = this.state;

    if (canDrop && dragItemId && inwardDragIndex > -1) {
      return connectDropTarget(
        <div className="form-generator-working-pane">
          {this.renderItems(order.slice(0, inwardDragIndex))}
          <CollectionSample
            id={dragItemId}
            key={dragItemId}
            title={inputTypeLocales[dragItemId]}
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
SortableList.contextTypes = contextTypes;

const allowedSources = [SAMPLE, BLOCK];

const target = {
  drop(props, monitor, component) {
    const { inwardDragIndex } = component.state;

    if (inwardDragIndex > -1) {
      const dragId = monitor.getItem().id;
      component.context.addItem(
        getDefaultInputScheme(dragId),
        inwardDragIndex,
      );
      component.setInwardDragIndex(-1);
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
