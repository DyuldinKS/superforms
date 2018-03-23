import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback, Input } from 'reactstrap';
import connectInput from './connectInput';
import { basePropTypes, baseDefaultProps } from './BaseInput';
import {
  notEmpty,
  isShorterOrEqual,
} from '../../utils/validators';
import createValidation from '../../utils/createValidation';

const propTypes = {
  ...basePropTypes,
  maxLength: PropTypes.number,
  textarea: PropTypes.bool,
};

const defaultProps = {
  ...baseDefaultProps,
  maxLength: null,
  textarea: false,
};

class InputString extends PureComponent {
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
      maxLength,
      required,
    } = this.props;

    if (required === true) {
      validators.push(notEmpty);
    }

    if (maxLength !== undefined) {
      validators.push(isShorterOrEqual(maxLength));
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
      name,
      required,
      textarea,
      value,
    } = this.props;

    return (
      <React.Fragment>
        <Input
          className={error ? 'is-invalid' : ''}
          name={name}
          onChange={this.handleChange}
          required={required === true}
          type={textarea ? 'textarea' : 'text'}
          value={value}
        />
        <FormFeedback>{error}</FormFeedback>
      </React.Fragment>
    );
  }
}

InputString.propTypes = propTypes;
InputString.defaultProps = defaultProps;

export default connectInput(InputString);
