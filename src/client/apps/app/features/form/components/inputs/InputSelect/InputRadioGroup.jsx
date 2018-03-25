import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import connectInput from '../connectInput';
import { basePropTypes, baseDefaultProps } from '../BaseInput';
import OptionOther from './OptionOther';
import { notEmpty } from '../../../utils/validators';

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

    this.createValidation = this.createValidation.bind(this);
    this.handleOptionToggle = this.handleOptionToggle.bind(this);
    this.handleOtherChange = this.handleOtherChange.bind(this);
  }

  componentDidMount() {
    this.validate = this.createValidation();
  }

  createValidation() {
    const { required } = this.props;

    if (required === true) {
      return notEmpty;
    }

    return () => null;
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
  }

  handleOtherChange(value) {
    const { name, setValue } = this.props;
    let nextValue = null;

    if (value !== undefined) {
      nextValue = { other: value };
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
                invalid={invalid}
                name={name}
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
