import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import connectInput from '../connectInput';
import { basePropTypes, baseDefaultProps } from '../BaseInput';
import OptionOther from './OptionOther';
import { notEmpty, notEmptyOptionOther } from '../../../utils/validators';
import createValidation from '../../../utils/createValidation';

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

class InputRadioGroup extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dirty: false,
    };

    this.createValidation = this.createValidation.bind(this);
    this.handleOptionToggle = this.handleOptionToggle.bind(this);
    this.handleOtherChange = this.handleOtherChange.bind(this);
  }

  componentDidMount() {
    this.validate = this.createValidation();
    const { name, setError, value } = this.props;
    const error = this.validate(value.trim());
    setError(name, error);
  }

  createValidation() {
    const validators = [];
    const { optionOther, required } = this.props;

    if (required) {
      return notEmpty;
    }

    if (optionOther) {
      validators.push(notEmptyOptionOther);
    }

    return createValidation(validators);
  }

  handleOptionToggle(event) {
    const { name, setValue, values: toggleMap = {} } = this.props;
    const { value: optionId } = event.target;
    let nextValue = null;

    if (toggleMap[optionId] === undefined) {
      nextValue = { [optionId]: true };
    }

    const error = this.validate(nextValue);
    setValue(name, nextValue, error);
    this.setState(() => ({ dirty: true }));
  }

  handleOtherChange(value) {
    const { name, setValue } = this.props;
    let nextValue = null;

    if (value !== undefined) {
      nextValue = { other: value };
    }

    const error = this.validate(nextValue);
    setValue(name, nextValue, error);
    this.setState(() => ({ dirty: true }));
  }

  isErrorVisible() {
    return this.props.submitError
      || (this.state.dirty && this.props.invalid);
  }

  render() {
    const {
      error,
      name,
      optionOther,
      options,
      required,
      value: toggleMap,
    } = this.props;

    return (
      <div className="input-check-wrapper">
        <FormGroup
          className={this.isErrorVisible() ? 'is-invalid' : ''}
          name={name}
          tag="fieldset"
        >
          {
            options.map((option, optionId) => (
              <FormGroup check key={optionId}>
                <Label check>
                  <Input
                    checked={toggleMap[optionId] === true}
                    onChange={this.handleOptionToggle}
                    required={required === true}
                    type="radio"
                    value={optionId}
                  />
                  {option}
                </Label>
              </FormGroup>
            ))
          }
          {
            optionOther
            ? (
              <OptionOther
                checked={toggleMap.other !== undefined}
                invalid={this.isErrorVisible()}
                onChange={this.handleOtherChange}
                required={required === true}
                type="radio"
                value={toggleMap.other}
              />
              )
            : null
          }
        </FormGroup>
        <FormFeedback>{error}</FormFeedback>
      </div>
    );
  }
}

InputRadioGroup.propTypes = propTypes;
InputRadioGroup.defaultProps = defaultProps;

export default connectInput(InputRadioGroup);
