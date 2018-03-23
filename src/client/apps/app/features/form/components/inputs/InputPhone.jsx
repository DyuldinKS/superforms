import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback, Input } from 'reactstrap';
import connectInput from './connectInput';
import { basePropTypes, baseDefaultProps } from './BaseInput';
import {
  notEmpty,
} from '../../utils/validators';
import createValidation from '../../utils/createValidation';

const propTypes = {
  ...basePropTypes,
};

const defaultProps = {
  ...baseDefaultProps,
};

class InputPhone extends PureComponent {
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
      required,
    } = this.props;

    if (required === true) {
      validators.push(notEmpty);
    }

    return createValidation(validators);
  }

  handleChange(event) {
    const { name, onChange } = this.props;
    const value = this.normalizeValue(event.target.value);
    const error = this.validate(value);
    onChange(name, value, error);
  }

  formatValue(value = "") {
    return `${value.slice(0,1)}(${value.slice(1, 4)})${value.slice(4, 7)}-${value.slice(7, 9)}-${value.slice(9, 11)}`;
  }

  normalizeValue(value) {
    return value.replace(/\D/g, '');
  }

  render() {
    const {
      error,
      name,
      required,
      value,
    } = this.props;

    return (
      <React.Fragment>
        <Input
          className={error ? 'is-invalid' : ''}
          name={name}
          onChange={this.handleChange}
          required={required === true}
          type="text"
          value={this.formatValue(value)}
        />
        <FormFeedback>{error}</FormFeedback>
      </React.Fragment>
    );
  }
}

InputPhone.propTypes = propTypes;
InputPhone.defaultProps = defaultProps;

export default connectInput(InputPhone);
