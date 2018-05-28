import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback } from 'reactstrap';
import validateWrapper from '../../utils/validateWrapper';

export const basePropTypes = {
  error: PropTypes.string,
  submitError: PropTypes.bool,
  invalid: PropTypes.bool,
  name: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  setError: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  value: PropTypes.any.isRequired,
};

export const baseDefaultProps = {
  error: null,
  submitError: false,
  invalid: false,
  readOnly: false,
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

  componentWillMount() {
    if (this.props.readOnly) {
      this.disableInput();
    } else {
      this.enableInput();
    }
  }

  componentDidMount() {
    const {
      name,
      required,
      setError,
      value,
    } = this.props;

    this.validate = this.getValidateFn();
    const error = validateWrapper(
      typeof (value) === 'string' ? value.trim() : value,
      required,
      this.validate,
    );
    setError(name, error);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.readOnly !== this.props.readOnly) {
      if (nextProps.readOnly) {
        this.disableInput();
      } else {
        this.enableInput();
      }
    }
  }

  disableInput() {
    this.onChange = () => {};
    this.onBlur = () => {};
  }

  enableInput() {
    this.onChange = this.handleChange;
    this.onBlur = this.handleBlur;
  }

  getValidateFn() {
    return () => null;
  }

  handleBlur() {
    const {
      name,
      required,
      setError,
      value,
    } = this.props;

    const error = validateWrapper(
      typeof (value) === 'string' ? value.trim() : value,
      required,
      this.validate,
    );
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
    return this.props.submitError
      || (!this.state.inputting && this.props.invalid);
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
