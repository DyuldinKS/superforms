import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SideBar from './components/SideBar';
import WorkingPane from './components/WorkingPane';

const propTypes = {};

const defaultProps = {};

class FormGeneratorRoute extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [
        {
          id: 'paragraph',
          name: 'Длинный ответ',
        },
        {
          id: 'phone',
          name: 'Номер телефона',
        },
      ],
    };

    this.addItem = this.addItem.bind(this);
    this.findItem = this.findItem.bind(this);
    this.moveItem = this.moveItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }

  addItem(item) {
    this.setState(state => ({
      items: [...state.items, item],
    }));
  }

  findItem(id) {
    const { items } = this.state;
    const entryItem = items.find(item => item.id === id);
    return {
      entryItem,
      index: items.indexOf(entryItem),
    };
  }

  moveItem(item, atIndex) {
    const {
      item: entryItem = item,
      index,
    } = this.findItem(item.id);

    this.setState(({ items }) => {
      let newItems = items;

      if (index > -1) {
        newItems = [
          ...items.slice(0, index),
          ...items.slice(index + 1),
        ];
      }

      return {
        items: [
          ...newItems.slice(0, atIndex),
          entryItem,
          ...newItems.slice(atIndex),
        ],
      };
    });
  }

  removeItem(id) {
    const { index } = this.findItem(id);

    this.setState(({ items }) => ({
      items: [
        ...items.slice(0, index),
        ...items.slice(index + 1),
      ],
    }));
  }

  render() {
    const { items } = this.state;

    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <div className="form-generator">
          <WorkingPane
            items={items}
            handleDrop={this.addItem}
            findItem={this.findItem}
            moveItem={this.moveItem}
            removeItem={this.removeItem}
          />
          <SideBar
            findItem={this.findItem}
            moveItem={this.moveItem}
            removeItem={this.removeItem}
          />
        </div>
      </DragDropContextProvider>
    );
  }
}

FormGeneratorRoute.propTypes = propTypes;
FormGeneratorRoute.defaultProps = defaultProps;

export default FormGeneratorRoute;
