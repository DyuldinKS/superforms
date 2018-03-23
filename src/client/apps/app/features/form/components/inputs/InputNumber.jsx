import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback, Input } from 'reactstrap';
import connectInput from './connectInput';
import { basePropTypes, baseDefaultProps } from './BaseInput';
import {
  notEmpty,
  isGreaterOrEqual,
  isLesserOrEqual,
  isNumber,
  isInteger,
} from '../../utils/validators';
import createValidation from '../../utils/createValidation';

const propTypes = {
  ...basePropTypes,
  integer: PropTypes.bool,
  max: PropTypes.number,
  min: PropTypes.number,
};

const defaultProps = {
  ...baseDefaultProps,
  integer: false,
  max: null,
  min: null,
};

class InputNumber extends PureComponent {
  constructor(props) {
    super(props);

    this.createValidation = this.createValidation.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.validate = this.createValidation();
  }

  createValidation() {
    const validators = [];
    const {
      integer,
      max,
      min,
      required,
    } = this.props;

    if (required === true) {
      validators.push(notEmpty);
    }

    if (integer === true) {
      validators.push(isInteger);
    } else {
      validators.push(isNumber);
    }

    if (min !== undefined) {
      validators.push(isGreaterOrEqual(min));
    }

    if (max !== undefined) {
      validators.push(isLesserOrEqual(max));
    }

    return createValidation(validators);
  }

  handleChange(event) {
    const { name, onChange } = this.props;
    const { value } = event.target;
    const error = this.validate(value.trim());
    onChange(name, value, error);
  }

  render() {
    const {
      error,
      max,
      min,
      name,
      required,
      value,
    } = this.props;

    return (
      <React.Fragment>
        <Input
          className={error ? 'is-invalid' : ''}
          max={max}
          min={min}
          name={name}
          onChange={this.handleChange}
          required={required === true}
          type="text"
          value={value}
        />
        <FormFeedback>{error}</FormFeedback>
      </React.Fragment>
    );
  }
}

InputNumber.propTypes = propTypes;
InputNumber.defaultProps = defaultProps;

export default connectInput(InputNumber);
