import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';
import connectInput from './connectInput';
import BaseInput from './BaseInput';
import {
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
  getValidateFn() {
    const validators = [];
    const {
      integer,
      max,
      min,
    } = this.props;

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
      readOnly,
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
          onBlur={this.onBlur}
          onChange={this.onChange}
          readOnly={readOnly}
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
