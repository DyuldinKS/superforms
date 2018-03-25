import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback } from 'reactstrap';

export const basePropTypes = {
  error: PropTypes.string,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  setError: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  value: PropTypes.any.isRequired,
};

export const baseDefaultProps = {
  error: null,
  required: false,
};

class BaseInput extends PureComponent {
  constructor(props) {
    super(props);

    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.validate = this.createValidation();
  }

  createValidation() {
    return () => null;
  }

  handleBlur() {
    const { name, setError, value } = this.props;
    const error = this.validate(value.trim());
    setError(name, error);
  }

  handleChange(event) {
    const { name, setValue } = this.props;
    const { value } = event.target;
    setValue(name, value);
  }

  render() {
    return (
      <FormFeedback>{this.props.error}</FormFeedback>
    );
  }
}

BaseInput.propTypes = basePropTypes;
BaseInput.defaultProps = baseDefaultProps;

export default BaseInput;
