import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback } from 'reactstrap';

export const basePropTypes = {
  error: PropTypes.string,
  invalid: PropTypes.bool,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  setError: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  value: PropTypes.any.isRequired,
};

export const baseDefaultProps = {
  error: null,
  invalid: false,
  required: false,
};

class BaseInput extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // default true to hide initial errors
      inputting: true,
    };

    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.validate = this.createValidation();
    const { name, setError, value } = this.props;
    const error = this.validate(value.trim());
    setError(name, error);
  }

  createValidation() {
    return () => null;
  }

  handleBlur() {
    const { name, setError, value } = this.props;
    const error = this.validate(value.trim());
    setError(name, error);
    this.setState(() => ({ inputting: false }));
  }

  handleChange(event) {
    const { name, setValue } = this.props;
    const { inputting } = this.state;
    const { value } = event.target;
    setValue(name, value);

    if (!inputting) {
      this.setState(() => ({ inputting: true }));
    }
  }

  isErrorVisible() {
    return !this.state.inputting && this.props.invalid;
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
