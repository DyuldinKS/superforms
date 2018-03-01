import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Button,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';
import withInputState from './withInputState';

const propTypes = {
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  className: PropTypes.string,
};

const defaultProps = {
  placeholder: 'Поиск',
  className: null,
};

class InputSearch extends Component {
  constructor(props) {
    super(props);

    this.handleClearButtonClick = this.handleClearButtonClick.bind(this);
  }

  handleClearButtonClick() {
    this.props.setValue('');
  }

  renderClearButton() {
    if (!this.props.value.length) {
      return null;
    }

    return (
      <InputGroupAddon addonType="append">
        <Button outline onClick={this.handleClearButtonClick}>
          Отмена
        </Button>
      </InputGroupAddon>
    );
  }

  render() {
    const {
      value,
      placeholder,
      handleChange,
      className,
    } = this.props;

    return (
      <InputGroup className={className}>
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
        {this.renderClearButton()}
      </InputGroup>
    );
  }
}

InputSearch.propTypes = propTypes;
InputSearch.defaultProps = defaultProps;

export default withInputState(InputSearch);
