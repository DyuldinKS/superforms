import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';
import connectInput from './connectInput';
import BaseInput from './BaseInput';
import { notEmpty } from '../../utils/validators';
import createValidation from '../../utils/createValidation';

const propTypes = {
  ...BaseInput.propTypes,
};

const defaultProps = {
  ...BaseInput.defaultProps,
};

class InputDate extends BaseInput {
  createValidation() {
    const validators = [];
    const { required } = this.props;

    if (required) {
      validators.push(notEmpty);
    }

    return createValidation(validators);
  }

  render() {
    const {
      name,
      required,
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
          type="date"
          value={value}
        />
        {super.render()}
      </React.Fragment>
    );
  }
}

InputDate.propTypes = propTypes;
InputDate.defaultProps = defaultProps;

export default connectInput(InputDate);
