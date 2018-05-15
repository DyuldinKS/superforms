import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';
import connectInput from './connectInput';
import BaseInput from './BaseInput';
import {
  notEmpty,
  isShorterOrEqual,
} from '../../utils/validators';
import createValidation from '../../utils/createValidation';

const propTypes = {
  ...BaseInput.propTypes,
  maxLength: PropTypes.number,
  textarea: PropTypes.bool,
};

const defaultProps = {
  ...BaseInput.defaultProps,
  maxLength: null,
  textarea: false,
};

class InputString extends BaseInput {
  createValidation() {
    const validators = [];
    const {
      maxLength,
      required,
    } = this.props;

    if (required) {
      validators.push(notEmpty);
    }

    if (maxLength) {
      validators.push(isShorterOrEqual(maxLength));
    }

    return createValidation(validators);
  }

  render() {
    const {
      name,
      required,
      textarea,
      value,
    } = this.props;

    return (
      <React.Fragment>
        <Input
          className={this.isErrorVisible() ? 'is-invalid' : ''}
          name={name}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          required={required === true}
          type={textarea ? 'textarea' : 'text'}
          value={value}
        />
        {super.render()}
      </React.Fragment>
    );
  }
}

InputString.propTypes = propTypes;
InputString.defaultProps = defaultProps;

export default connectInput(InputString);
