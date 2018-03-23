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

class InputDate extends PureComponent {
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
    const { required } = this.props;

    if (required === true) {
      validators.push(notEmpty);
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
      value,
    } = this.props;

    return (
      <React.Fragment>
        <Input
          className={error ? 'is-invalid' : ''}
          name={name}
          onChange={this.handleChange}
          required={required === true}
          type="date"
          value={value}
        />
        <FormFeedback>{error}</FormFeedback>
      </React.Fragment>
    );
  }
}

InputDate.propTypes = propTypes;
InputDate.defaultProps = defaultProps;

export default connectInput(InputDate);
