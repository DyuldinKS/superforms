import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import connectInput from '../connectInput';
import { basePropTypes, baseDefaultProps } from '../BaseInput';
import OptionOther from './OptionOther';
import { notEmpty, notEmptyOptionOther } from '../../../utils/validators';
import createValidation from '../../../utils/createValidation';
import deleteMapProp from '../../../utils/deleteMapProp';

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

class InputCheckboxGroup extends PureComponent {
  constructor(props) {
    super(props);

    this.createValidation = this.createValidation.bind(this);
    this.handleOptionToggle = this.handleOptionToggle.bind(this);
    this.handleOtherChange = this.handleOtherChange.bind(this);
  }

  componentDidMount() {
    this.validate = this.createValidation();
  }

  createValidation() {
    const validators = [];
    const { optionOther, required } = this.props;

    if (required === true) {
      validators.push(notEmpty);
    }

    if (optionOther === true) {
      validators.push(notEmptyOptionOther);
    }

    return createValidation(validators);
  }

  handleOptionToggle(event) {
    const { name, setValue, value: toggleMap = {} } = this.props;
    const { value: optionId } = event.target;
    let value = {};

    if (toggleMap[optionId] === undefined) {
      value = { ...toggleMap, [optionId]: true };
    } else {
      value = deleteMapProp(toggleMap, optionId);
    }

    const error = this.validate(value);
    setValue(name, value, error);
  }

  handleOtherChange(value) {
    const { name, setValue, value: toggleMap = {} } = this.props;
    let nextValue = {};

    if (value !== undefined) {
      nextValue = { ...toggleMap, other: value };
    } else {
      nextValue = deleteMapProp(toggleMap, 'other');
    }

    const error = this.validate(nextValue);
    setValue(name, nextValue, error);
  }

  render() {
    const {
      error,
      invalid,
      name,
      optionOther,
      options,
      required,
      value: toggleMap,
    } = this.props;

    return (
      <div className="input-check-wrapper">
        <FormGroup tag="fieldset" className={invalid ? 'is-invalid' : ''}>
          {
            options.map((option, optionId) => (
              <FormGroup check key={optionId}>
                <Label check>
                  <Input
                    checked={toggleMap[optionId] === true}
                    name={name}
                    onChange={this.handleOptionToggle}
                    required={required === true}
                    type="checkbox"
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
                invalid={invalid}
                name={name}
                onChange={this.handleOtherChange}
                required={required === true}
                type="checkbox"
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

InputCheckboxGroup.propTypes = propTypes;
InputCheckboxGroup.defaultProps = defaultProps;

export default connectInput(InputCheckboxGroup);
