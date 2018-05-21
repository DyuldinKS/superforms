import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import connectInput from '../connectInput';
import { basePropTypes, baseDefaultProps } from '../BaseInput';
import OptionOther from './OptionOther';
import { notEmptyOptionOther } from '../../../utils/validators';
import createValidation from '../../../utils/createValidation';
import validateWrapper from '../../../utils/validateWrapper';
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

    this.state = {
      dirty: false,
    };

    this.getValidateFn = this.getValidateFn.bind(this);
    this.handleOptionToggle = this.handleOptionToggle.bind(this);
    this.handleOtherChange = this.handleOtherChange.bind(this);
  }

  componentDidMount() {
    this.validate = this.getValidateFn();
    const {
      name,
      required,
      setError,
      value,
    } = this.props;
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

  handleOptionToggle(event) {
    const {
      name,
      required,
      setValue,
      value: toggleMap = {},
    } = this.props;
    const { value: optionId } = event.target;
    let value = {};

    if (toggleMap[optionId] === undefined) {
      value = { ...toggleMap, [optionId]: true };
    } else {
      value = deleteMapProp(toggleMap, optionId);
    }

    const error = validateWrapper(value, required, this.validate);
    setValue(name, value, error);
    this.setState(() => ({ dirty: true }));
  }

  handleOtherChange(value) {
    const {
      name,
      required,
      setValue,
      value: toggleMap = {},
    } = this.props;
    let nextValue = {};

    if (value !== undefined) {
      nextValue = { ...toggleMap, other: value };
    } else {
      nextValue = deleteMapProp(toggleMap, 'other');
    }

    const error = validateWrapper(nextValue, required, this.validate);
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
        <fieldset
          className={this.isErrorVisible() ? 'is-invalid' : ''}
          name={name}
        >
          {
            options.map((option, optionId) => (
              <FormGroup check key={optionId}>
                <Label check>
                  <Input
                    checked={toggleMap[optionId] === true}
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
                invalid={this.isErrorVisible()}
                name={name}
                onChange={this.handleOtherChange}
                required={required === true}
                type="checkbox"
                value={toggleMap.other}
              />
              )
            : null
          }
        </fieldset>
        <FormFeedback>{error}</FormFeedback>
      </div>
    );
  }
}

InputCheckboxGroup.propTypes = propTypes;
InputCheckboxGroup.defaultProps = defaultProps;

export default connectInput(InputCheckboxGroup);
