import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  Input,
  InputGroup,
  Label,
} from 'reactstrap';
import SelectOptionsTextareaModal from './SelectOptionsTextareaModal';

const propTypes = {
  options: PropTypes.array,
  updateOptions: PropTypes.func.isRequired,
};

const defaultProps = {
  options: [],
};

class ItemSelectOptionsSettings extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { textareaModal: false };

    this.handleAdd = this.handleAdd.bind(this);
    this.handleAddList = this.handleAddList.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleRemove = this.handleRemove.bind(this);

    this.toggleModal = this.toggleModal.bind(this);
  }

  handleAdd() {
    const { options, updateOptions } = this.props;
    const newOption = `Вариант ${options.length + 1}`;
    const nextOptions = [...options, newOption];
    updateOptions(nextOptions);
  }

  handleAddList(prompt) {
    if (!prompt || !prompt.trim()) {
      this.toggleModal();
      return;
    }

    const list = prompt.split('\n').map(v => v.trim());

    const { options, updateOptions } = this.props;
    const nextOptions = [...options, ...list];
    updateOptions(nextOptions);
    this.toggleModal();
  }

  handleInput(event, optionId) {
    const { value } = event.target;
    const { options, updateOptions } = this.props;
    const nextOptions = options.slice();
    nextOptions[optionId] = value;
    updateOptions(nextOptions);
  }

  handleRemove(index) {
    const { options, updateOptions } = this.props;
    const nextOptions = [
      ...options.slice(0, index),
      ...options.slice(index + 1),
    ];
    updateOptions(nextOptions);
  }

  toggleModal() {
    this.setState(({ textareaModal }) => ({ textareaModal: !textareaModal }));
  }

  renderOptions() {
    const { options } = this.props;
    return options.map((option, index) => (
      <FormGroup key={index} >
        <InputGroup>
          <Input
            bsSize="sm"
            type="text"
            name={`options.${index}`}
            value={option}
            onChange={event => this.handleInput(event, index)}
          />
          <div className="input-group-append">
            <Button size="sm" onClick={() => this.handleRemove(index)}>
              X
            </Button>
          </div>
        </InputGroup>
      </FormGroup>
    ));
  }

  render() {
    const { textareaModal } = this.state;

    return (
      <div
        className="item-settings-section item-settings-section-select-options"
      >
        <Label>Варианты ответа</Label>
        {this.renderOptions()}
        <FormGroup className="item-settings-section-select-options-actions">
          <Button
            size="sm"
            onClick={this.handleAdd}
          >
            Добавить
          </Button>
          <Button
            color="link"
            size="sm"
            onClick={this.toggleModal}
          >
            Добавить списком
          </Button>
        </FormGroup>

        {
          textareaModal
          ? <SelectOptionsTextareaModal
              closeModal={this.toggleModal}
              onAdd={this.handleAddList}
            />
          : null
        }
      </div>
    );
  }
}

ItemSelectOptionsSettings.propTypes = propTypes;
ItemSelectOptionsSettings.defaultProps = defaultProps;

export default ItemSelectOptionsSettings;
