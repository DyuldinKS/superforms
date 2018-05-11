import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import * as inputTypes from 'shared/form/utils/inputTypes';
import ItemSettingsTogglers from './ItemSettingsTogglers';
import ItemSettingsSelectOptions from './ItemSettingsSelectOptions';
import getTogglers from '../utils/getTogglers';

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

    this.getValue = this.getValue.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateItemSelectOptions = this.updateItemSelectOptions.bind(this);

    this.togglers = getTogglers(props.item);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.item.type !== nextProps.item.type) {
      this.togglers = getTogglers(nextProps.item);
    }
  }

  handleChange(event) {
    const { target } = event;
    const { name } = target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { id, updateItem } = this.props;
    updateItem(id, name, value);
  }

  getValue(name) {
    return this.props.item[name];
  }

  updateItemSelectOptions(options) {
    const { id, updateItem } = this.props;
    updateItem(id, 'options', options);
  }

  render() {
    const {
      itemIndex,
      onClose,
    } = this.props;

    return (
      <div className="form-generator-side-bar item-settings">
        <header>
          <h2>{`Вопрос #${itemIndex}`}</h2>
          <Button size="sm" onClick={onClose}>Закрыть</Button>
        </header>

        <div className="item-settings-section">
          <FormGroup>
            <Label>Тип ответа</Label>
            <Input
              bsSize="sm"
              type="select"
              name="type"
              value={this.getValue('type') || ''}
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
              type="textarea"
              rows="2"
              name="title"
              value={this.getValue('title') || ''}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Описание</Label>
            <Input
              bsSize="sm"
              type="textarea"
              rows="2"
              name="description"
              value={this.getValue('description') || ''}
              onChange={this.handleChange}
            />
          </FormGroup>
        </div>

        {
          this.getValue('type') === inputTypes.constants.SELECT
          ? <ItemSettingsSelectOptions
              options={this.getValue('options')}
              updateOptions={this.updateItemSelectOptions}
            />
          : null
        }

        <ItemSettingsTogglers
          togglers={this.togglers}
          getValue={this.getValue}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

ItemSettings.propTypes = propTypes;
ItemSettings.defaultProps = defaultProps;

export default ItemSettings;
