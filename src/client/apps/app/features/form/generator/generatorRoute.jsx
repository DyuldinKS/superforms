import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import uuidv1 from 'uuid/v1';
import * as formsModule from 'apps/app/shared/redux/forms';
import deleteMapProp from 'shared/form/utils/deleteMapProp';
import { BlockTransitions } from 'shared/router/components';
import ItemsCollection from './components/ItemsCollection';
import HeaderSettings from './components/HeaderSettings';
import ItemSettings from './components/ItemSettings';
import WorkingPane from './components/WorkingPane';
import SavePanel from './components/SavePanel';

const propTypes = {
  // from Redux
  id: PropTypes.string.isRequired,
  description: PropTypes.string,
  items: PropTypes.object,
  order: PropTypes.array,
  title: PropTypes.string,
  updateForm: PropTypes.func.isRequired,
  updating: PropTypes.bool,
  updated: PropTypes.string,
};

const defaultProps = {
  // from Redux
  description: '',
  items: {},
  order: [],
  title: '',
  updating: false,
  updated: '',
};

const initialState = {
  selectedItem: null,
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

function checkFormPropsChange(before, after) {
  return before.title !== after.title
    || before.description !== after.description
    || before.order !== after.order
    || before.items !== after.items;
}

class FormGenerator extends Component {
  constructor(props) {
    super(props);

    const {
      title,
      description,
      order,
      items,
    } = props;

    this.state = {
      title,
      description,
      order,
      items,
      ...initialState,
    };

    this.updateHeader = this.updateHeader.bind(this);
    this.addItem = this.addItem.bind(this);
    this.duplicateItem = this.duplicateItem.bind(this);
    this.findItem = this.findItem.bind(this);
    this.getItem = this.getItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.reorderItem = this.reorderItem.bind(this);
    this.updateItem = this.updateItem.bind(this);

    this.selectItem = this.selectItem.bind(this);
    this.clearSelectedItem = this.clearSelectedItem.bind(this);

    this.postUpdates = this.postUpdates.bind(this);
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

  componentWillReceiveProps(nextProps) {
    if (checkFormPropsChange(this.props, nextProps)) {
      this.syncStateWithProps(nextProps);
    }
  }

  updateHeader(prop, value) {
    if (prop !== 'title' && prop !== 'description') {
      return;
    }

    this.setState((state) => {
      const nextState = !value
        ? deleteMapProp(state, prop)
        : { ...state, [prop]: value };

      return nextState;
    });
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
        selectedItem: state.selectedItem === id
          ? null
          : state.selectedItem,
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

  postUpdates() {
    const { updateForm, id } = this.props;
    const {
      title,
      description,
      order,
      items,
    } = this.state;
    updateForm(id, { title, description, scheme: { order, items } });
  }

  syncStateWithProps(props) {
    this.setState(state => ({
      ...state,
      title: props.title,
      description: props.description,
      order: props.order,
      items: props.items,
    }));
  }

  renderSettingsBar() {
    const { selectedItem } = this.state;

    if (selectedItem === 'header') {
      const { title, description } = this.state;

      return (
        <HeaderSettings
          title={title}
          description={description}
          onClose={this.clearSelectedItem}
          updateHeader={this.updateHeader}
        />
      );
    }

    return (
      <ItemSettings
        id={selectedItem}
        item={this.getItem(selectedItem)}
        itemIndex={this.findItem(selectedItem) + 1}
        onClose={this.clearSelectedItem}
        updateItem={this.updateItem}
      />
    );
  }

  render() {
    const { title, order, selectedItem } = this.state;
    const { updated, updating } = this.props;
    const hasUnsavedChanges = checkFormPropsChange(this.state, this.props);

    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <div className="form-generator">
          <div className="form-generator-content">
            <WorkingPane
              title={title}
              order={order}
              selectedItem={selectedItem}
            />

            <BlockTransitions
              when={hasUnsavedChanges}
            />

            <SavePanel
              hasUnsavedChanges={hasUnsavedChanges}
              lastSave={updated}
              onSave={this.postUpdates}
              updating={updating}
            />
          </div>

          {
            selectedItem
            ? this.renderSettingsBar()
            : <ItemsCollection />
          }
        </div>
      </DragDropContextProvider>
    );
  }
}

FormGenerator.propTypes = propTypes;
FormGenerator.defaultProps = defaultProps;
FormGenerator.childContextTypes = childContextTypes;

function mapStateToProps(state, ownProps) {
  const { id } = ownProps.match.params;
  const {
    description,
    scheme,
    title,
    updated,
    updating,
  } = formsModule.selectors.getFormEntity(state, id);
  const {
    items,
    order,
  } = scheme;

  return {
    id,
    description,
    items,
    order,
    title,
    updated,
    updating,
  };
}

const mapDispatchToProps = {
  updateForm: formsModule.actions.update,
};

export default connect(mapStateToProps, mapDispatchToProps)(FormGenerator);
