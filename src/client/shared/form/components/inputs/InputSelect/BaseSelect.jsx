import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback } from 'reactstrap';
import OptionOther from './OptionOther';
import { basePropTypes, baseDefaultProps } from '../BaseInput';
import { notEmptyOptionOther } from '../../../utils/validators';
import createValidation from '../../../utils/createValidation';
import validateWrapper from '../../../utils/validateWrapper';

const propTypes = {
  ...basePropTypes,
  options: PropTypes.array,
  optionOther: PropTypes.bool,
};

const defaultProps = {
  ...baseDefaultProps,
  options: [],
  optionOther: false,
};

class BaseSelect extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dirty: false,
    };

    this.getValidateFn = this.getValidateFn.bind(this);
  }

  componentDidMount() {
    const {
      name,
      required,
      setError,
      value,
    } = this.props;

    this.validate = this.getValidateFn();
    const error = validateWrapper(value, required, this.validate);
    setError(name, error);
  }

  getValidateFn() {
    const validators = [];
    const { optionOther } = this.props;

    if (optionOther) {
      validators.push(notEmptyOptionOther);
    }

    return createValidation(validators);
  }

  isErrorVisible() {
    return this.props.submitError
      || (this.state.dirty && this.props.invalid);
  }

  renderError() {
    const { error } = this.props;

    return (
      <FormFeedback>{error}</FormFeedback>
    );
  }

  renderOptionOther() {
    const {
      multiple,
      name,
      required,
      value: toggleMap,
    } = this.props;

    return (
      <OptionOther
        checked={toggleMap.other !== undefined}
        invalid={this.isErrorVisible()}
        name={name}
        onChange={this.handleOtherChange}
        required={required}
        type={multiple ? 'checkbox' : 'radio'}
        value={toggleMap.other}
      />
    );
  }
}

BaseSelect.propTypes = propTypes;
BaseSelect.defaultProps = defaultProps;

export default BaseSelect;
