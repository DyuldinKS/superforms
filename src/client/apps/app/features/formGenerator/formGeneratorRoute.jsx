import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import uuidv1 from 'uuid/v1';
import deleteMapProp from 'shared/form/utils/deleteMapProp';
import Form from 'shared/form/components/Form';
import Header from './components/Header';
import ItemsCollection from './components/ItemsCollection';
import ItemSettings from './components/ItemSettings';
import WorkingPane from './components/WorkingPane';

const propTypes = {};

const defaultProps = {};

const initialState = {
  items: {
    abcd: {
      itemType: 'input',
      title: 'Любое число',
      type: 'number',
      required: true,
      min: 0,
      max: 15,
    },
    qwer: {
      itemType: 'input',
      title: 'Несколько из списка',
      type: 'select',
      multiple: true,
      options: [
        'Cookie',
        'Banana',
        'Ice-cream',
      ],
      optionOther: true,
      required: true,
    },
  },
  order: ['abcd', 'qwer'],
  selectedItem: null,
  activeTab: 'generator',
};

const childContextTypes = {
  addItem: PropTypes.func.isRequired,
  duplicateItem: PropTypes.func.isRequired,
  findItem: PropTypes.func.isRequired,
  getItem: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  reorderItem: PropTypes.func.isRequired,
  selectItem: PropTypes.func.isRequired,
};

class FormGeneratorRoute extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.addItem = this.addItem.bind(this);
    this.duplicateItem = this.duplicateItem.bind(this);
    this.findItem = this.findItem.bind(this);
    this.getItem = this.getItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.reorderItem = this.reorderItem.bind(this);
    this.updateItem = this.updateItem.bind(this);

    this.selectItem = this.selectItem.bind(this);
    this.clearSelectedItem = this.clearSelectedItem.bind(this);

    this.changeTab = this.changeTab.bind(this);
  }

  getChildContext() {
    return {
      addItem: this.addItem,
      duplicateItem: this.duplicateItem,
      findItem: this.findItem,
      getItem: this.getItem,
      removeItem: this.removeItem,
      reorderItem: this.reorderItem,
      selectItem: this.selectItem,
    };
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

  duplicateItem(id) {
    const item = { ...this.getItem(id) };
    const order = this.findItem(id);
    this.addItem(item, order + 1);
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
      return {
        ...state,
        items: deleteMapProp(items, id),
        order: [
          ...order.slice(0, index),
          ...order.slice(index + 1),
        ],
      };
    });
  }

  reorderItem(id, index) {
    this.setState((state) => {
      const newOrder = state.order.filter(itemId => itemId !== id);
      newOrder.splice(index, 0, id);
      return {
        ...state,
        order: newOrder,
      };
    });
  }

  selectItem(id) {
    this.setState(state => ({
      ...state,
      selectedItem: id,
    }));
  }

  clearSelectedItem() {
    this.setState(state => ({
      ...state,
      selectedItem: null,
    }));
  }

  updateItem(id, prop, value) {
    this.setState((state) => {
      const item = this.getItem(id);
      const nextItem = !value
        ? deleteMapProp(item, prop)
        : { ...item, [prop]: value };

      return {
        ...state,
        items: {
          ...state.items,
          [id]: nextItem,
        },
      };
    });
  }

  changeTab(activeTab) {
    this.setState(state => ({
      ...state,
      activeTab,
    }));
  }

  renderGenerator() {
    const {
      order,
      selectedItem,
    } = this.state;

    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <div className="form-generator">
          <WorkingPane order={order} />

          {
            selectedItem
            ? <ItemSettings
                id={selectedItem}
                item={this.getItem(selectedItem)}
                itemIndex={this.findItem(selectedItem) + 1}
                onClose={this.clearSelectedItem}
                updateItem={this.updateItem}
              />
            : <ItemsCollection />
          }
        </div>
      </DragDropContextProvider>
    );
  }

  renderForm() {
    const { order, items } = this.state;
    const scheme = { order, items };
    const form = { scheme };

    return (
      <Form form={form} />
    );
  }

  render() {
    const { activeTab } = this.state;

    return (
      <div className="app-form-generator">
        <Header
          activeTab={activeTab}
          onChange={this.changeTab}
        />
        {
          activeTab === 'generator'
          ? this.renderGenerator()
          : this.renderForm()
        }
      </div>
    );
  }
}

FormGeneratorRoute.propTypes = propTypes;
FormGeneratorRoute.defaultProps = defaultProps;
FormGeneratorRoute.childContextTypes = childContextTypes;

export default FormGeneratorRoute;
