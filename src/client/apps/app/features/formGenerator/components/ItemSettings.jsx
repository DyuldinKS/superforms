import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import * as inputTypes from 'shared/form/utils/inputTypes';

const propTypes = {
  id: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
  itemIndex: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  updateItem: PropTypes.func.isRequired,
};

const defaultProps = {
  item: {},
};

const typeOptions = Object.values(inputTypes.constants);

class ItemSettings extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { name, value } = event.target;
    const { id, updateItem } = this.props;
    updateItem(id, name, value);
  }

  getValue(name) {
    return this.props.item[name] || '';
  }

  render() {
    const {
      item,
      itemIndex,
      onClose,
    } = this.props;
    const { title } = item;

    return (
      <div className="form-generator-side-bar item-settings">
        <header>
          <h2>{`Вопрос #${itemIndex}`}</h2>
          <button onClick={onClose}>Close</button>
        </header>

        <div className="item-settings-section">
          <FormGroup>
            <Label>Тип ответа</Label>
            <Input
              bsSize="sm"
              type="select"
              name="type"
              value={this.getValue('type')}
              onChange={this.handleChange}
            >
              {typeOptions.map(type => (
                <option
                  value={type}
                  key={type}
                >
                  {inputTypes.locales[type]}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label>Текст</Label>
            <Input
              bsSize="sm"
              type="text"
              name="title"
              value={this.getValue('title')}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Описание</Label>
            <Input
              bsSize="sm"
              type="text"
              name="desc"
              value={this.getValue('desc')}
              onChange={this.handleChange}
            />
          </FormGroup>
        </div>
      </div>
    );
  }
}

ItemSettings.propTypes = propTypes;
ItemSettings.defaultProps = defaultProps;

export default ItemSettings;
