import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Input } from 'reactstrap';
import { basePropTypes, baseDefaultProps } from '../BaseInput';

const propTypes = {
  ...basePropTypes,
  checked: PropTypes.bool,
  invalid: PropTypes.bool,
  type: PropTypes.oneOf(['radio', 'checkbox']),
  value: PropTypes.string,
};

const defaultProps = {
  ...baseDefaultProps,
  checked: false,
  invalid: false,
  type: 'checkbox',
  value: '',
};

class OptionOther extends Component {
  constructor(props) {
    super(props);

    this.handleOtherBlur = this.handleOtherBlur.bind(this);
    this.handleOtherFocus = this.handleOtherFocus.bind(this);
    this.handleOtherInput = this.handleOtherInput.bind(this);
    this.handleOtherToggle = this.handleOtherToggle.bind(this);
  }

  disableOtherOption() {
    const { onChange } = this.props;
    onChange(undefined);
  }

  handleOtherBlur(event) {
    const { value } = event.target;
    if (!value) {
      this.disableOtherOption();
    }
  }

  handleOtherFocus() {
    const { onChange, value } = this.props;

    if (value) {
      return;
    }

    onChange('');
  }

  handleOtherInput(event) {
    const { onChange } = this.props;
    const { value } = event.target;
    onChange(value);
  }

  handleOtherToggle() {
    const { checked } = this.props;
    if (!checked) {
      this.otherInputEl.focus();
    } else {
      this.disableOtherOption();
    }
  }

  render() {
    const {
      checked,
      invalid,
      name,
      required,
      type,
      value,
    } = this.props;

    return (
      <FormGroup
        check
        className={`input-select-option-other ${
          invalid
            ? 'is-invalid'
            : ''
        }`}
      >
        <Input
          checked={checked}
          name={name}
          onChange={this.handleOtherToggle}
          required={required === true}
          type={type}
          value="other"
        />
        <Input
          bsSize="sm"
          className={invalid ? 'is-invalid' : ''}
          innerRef={(input) => { this.otherInputEl = input; }}
          name={`${name}.other`}
          onBlur={this.handleOtherBlur}
          onChange={this.handleOtherInput}
          onFocus={this.handleOtherFocus}
          placeholder="Свой вариант"
          required={required === true}
          type="text"
          value={value}
        />
      </FormGroup>
    );
  }
}

OptionOther.propTypes = propTypes;
OptionOther.defaultProps = defaultProps;

export default OptionOther;
