import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback } from 'reactstrap';
import createValidation from '../../utils/createValidation';
import composeValidatorsByProps from '../../utils/validators';

export const basePropTypes = {
  error: PropTypes.string,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any.isRequired,
};

export const baseDefaultProps = {
  error: null,
  required: false,
};

class BaseInput extends PureComponent {
  constructor(props) {
    super(props);

    this.propsThatAffectValidation = [];

    this.createValidation = this.createValidation.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.validate = this.createValidation();
  }

  componentDidUpdate(prevProps) {
    if (this.propsThatAffectValidation.some(name =>
      this.props[name] !== prevProps[name])) {
      this.validate = this.createValidation();
    }
  }

  createValidation() {
    const validators = composeValidatorsByProps(
      this.props,
      this.propsThatAffectValidation,
    );
    return createValidation(validators);
  }

  handleChange(event) {
    const { name, onChange } = this.props;
    const { value } = event.target;
    const error = this.validate(value.trim());
    onChange(name, value, error);
  }

  render() {
    const { error } = this.props;

    return <FormFeedback>{error}</FormFeedback>;
  }
}

BaseInput.propTypes = basePropTypes;
BaseInput.defaultProps = baseDefaultProps;

export default BaseInput;
