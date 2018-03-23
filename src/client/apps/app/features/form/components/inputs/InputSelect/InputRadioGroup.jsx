import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormText, FormGroup, Input, Label } from 'reactstrap';
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
    const { name, onChange, values: toggleMap = {} } = this.props;
    const { value: optionId } = event.target;
    let nextValue = null;

    if (toggleMap[optionId] === undefined) {
      nextValue = { [optionId]: true };
    }

    const error = this.validate(nextValue);
    onChange(name, nextValue, error);
  }

  handleOtherChange(value) {
    const { name, onChange } = this.props;
    let nextValue = null;

    if (value !== undefined) {
      nextValue = { other: value };
    }

    const error = this.validate(nextValue);
    onChange(name, nextValue, error);
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
    const invalid = !!error;

    return (
      <React.Fragment>
        <FormGroup tag="fieldset">
          {
            options.map((option, optionId) => (
              <FormGroup
                check
                className={invalid ? 'is-invalid' : ''}
                key={optionId}
              >
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
        <FormText color="danger">{error}</FormText>
      </React.Fragment>
    );
  }
}

InputRadioGroup.propTypes = propTypes;
InputRadioGroup.defaultProps = defaultProps;

export default connectInput(InputRadioGroup);
