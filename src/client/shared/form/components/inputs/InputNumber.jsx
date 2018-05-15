import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';
import connectInput from './connectInput';
import BaseInput from './BaseInput';
import {
  notEmpty,
  isGreaterOrEqual,
  isLesserOrEqual,
  isNumber,
  isInteger,
} from '../../utils/validators';
import createValidation from '../../utils/createValidation';

const propTypes = {
  ...BaseInput.propTypes,
  integer: PropTypes.bool,
  max: PropTypes.number,
  min: PropTypes.number,
};

const defaultProps = {
  ...BaseInput.defaultProps,
  integer: false,
  max: null,
  min: null,
};

class InputNumber extends BaseInput {
  createValidation() {
    const validators = [];
    const {
      integer,
      max,
      min,
      required,
    } = this.props;

    if (required) {
      validators.push(notEmpty);
    }

    if (integer) {
      validators.push(isInteger);
    } else {
      validators.push(isNumber);
    }

    if (min) {
      validators.push(isGreaterOrEqual(min));
    }

    if (max) {
      validators.push(isLesserOrEqual(max));
    }

    return createValidation(validators);
  }

  render() {
    const {
      max,
      min,
      name,
      required,
      value,
    } = this.props;

    return (
      <React.Fragment>
        <Input
          className={this.isErrorVisible() ? 'is-invalid' : ''}
          max={max}
          min={min}
          name={name}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          required={required === true}
          type="text"
          value={value}
        />
        {super.render()}
      </React.Fragment>
    );
  }
}

InputNumber.propTypes = propTypes;
InputNumber.defaultProps = defaultProps;

export default connectInput(InputNumber);
