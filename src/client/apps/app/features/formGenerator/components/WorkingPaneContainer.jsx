import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuidv1 from 'uuid/v1';
import SortableList from './SortableList';
import deleteMapProp from 'shared/form/utils/deleteMapProp';

const propTypes = {};

const defaultProps = {};

const initialState = {
  items: {
    abcd: {
      name: 'Длинный ответ',
    },
    qwer: {
      name: 'Номер телефона',
    },
    rtyu: {
      name: 'Олег',
    },
    iopl: {
      name: 'Петр',
    },
    kjhg: {
      name: 'Семен',
    },
  },
  order: ['abcd', 'qwer', 'rtyu', 'iopl', 'kjhg'],
  inwardDragIndex: -1,
};

class WorkingPaneContainer extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.addItem = this.addItem.bind(this);
    this.findItem = this.findItem.bind(this);
    this.getItem = this.getItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.swapItems = this.swapItems.bind(this);
    this.setInwardDragIndex = this.setInwardDragIndex.bind(this);
  }

  addItem(item, atIndex) {
    const id = uuidv1().slice(0, 4);
    this.setState((state) => {
      const newOrder = atIndex === undefined
        ? [...state.order, id]
        : [
          ...state.order.slice(0, atIndex),
          id,
          ...state.order.slice(atIndex),
        ];

      return {
        inwardDragIndex: -1,
        items: {
          ...state.items,
          [id]: item,
        },
        order: newOrder,
      };
    });
  }

  findItem(id) {
    return this.state.order.indexOf(id);
  }

  getItem(id) {
    return this.state.items[id];
  }

  removeItem(id) {
    this.setState((state) => {
      const { items, order } = state;
      const index = order.indexOf(id);
      if (index < 0) return state;
      return ({
        ...state,
        items: deleteMapProp(items, id),
        order: [
          ...order.slice(0, index),
          ...order.slice(index + 1),
        ],
      });
    });
  }

  swapItems(a, b) {
    this.setState((state) => {
      const { order } = state;
      const newOrder = order.slice();
      [newOrder[a], newOrder[b]] = [newOrder[b], newOrder[a]];

      return {
        ...state,
        order: newOrder,
      };
    });
  }

  setInwardDragIndex(index = -1) {
    this.setState(state => ({
      ...state,
      inwardDragIndex: index,
    }));
  }

  render() {
    const { order, inwardDragIndex } = this.state;

    return (
      <SortableList
        {...this.props}
        order={order}
        inwardDragIndex={inwardDragIndex}
        addItem={this.addItem}
        findItem={this.findItem}
        getItem={this.getItem}
        removeItem={this.removeItem}
        swapItems={this.swapItems}
        setInwardDragIndex={this.setInwardDragIndex}
      />
    );
  }
}

WorkingPaneContainer.propTypes = propTypes;
WorkingPaneContainer.defaultProps = defaultProps;

export default WorkingPaneContainer;
