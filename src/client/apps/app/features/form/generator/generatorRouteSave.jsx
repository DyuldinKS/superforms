import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import uuidv1 from 'uuid/v1';
import deleteMapProp from 'shared/form/utils/deleteMapProp';
import Form from 'shared/form/components/Form';
import * as formsModule from 'apps/app/shared/redux/forms';
import Header from './components/Header';
import ItemsCollection from './components/ItemsCollection';
import HeaderSettings from './components/HeaderSettings';
import ItemSettings from './components/ItemSettings';
import WorkingPane from './components/WorkingPane';

const propTypes = {
  id: PropTypes.string.isRequired,
  form: PropTypes.object,
};

const defaultProps = {
  form: {},
};

const initialState = {
  selectedItem: null,
  activeTab: 'generator',
  // form
  title: 'Тест',
  description: 'Короткое описание',
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

class FormRoute extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;

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

  componentDidMount() {
    const { fetchForm, id } = this.props;
    fetchForm(id);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.form !== nextProps.form) {
      this.setState(state => ({
        ...state,
        ...nextProps.form,
        ...nextProps.form.scheme,
      }));
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

  renderGeneratorSettingsBar() {
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

  renderGenerator() {
    const {
      title,
      order,
      selectedItem,
    } = this.state;

    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <div className="form-generator">
          <WorkingPane
            title={title}
            order={order}
          />

          {
            selectedItem
            ? this.renderGeneratorSettingsBar()
            : <ItemsCollection />
          }
        </div>
      </DragDropContextProvider>
    );
  }

  renderForm() {
    const { order, items, title, description } = this.state;
    const scheme = { order, items };
    const form = { scheme, title, description };

    return (
      <Form form={form} />
    );
  }

  render() {
    const { activeTab } = this.state;

    if (!this.props.form.scheme) {
      return 'Загрузка';
    }

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

FormRoute.propTypes = propTypes;
FormRoute.defaultProps = defaultProps;
FormRoute.childContextTypes = childContextTypes;

function mapStateToProps(state, ownProps) {
  const formId = ownProps.match.params.id;
  const form = formsModule.selectors.getFormEntity(state, formId);

  return {
    form,
    id: formId,
  };
}

const mapDispatchToProps = {
  fetchForm: formsModule.actions.fetch,
};

export default connect(mapStateToProps, mapDispatchToProps)(FormRoute);

