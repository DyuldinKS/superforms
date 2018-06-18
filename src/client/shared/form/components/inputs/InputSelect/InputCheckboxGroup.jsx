import React from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import connectInput from '../connectInput';
import BaseSelect from './BaseSelect';
import deleteMapProp from '../../../utils/deleteMapProp';
import validateWrapper from '../../../utils/validateWrapper';

class InputCheckboxGroup extends BaseSelect {
  constructor(props) {
    super(props);

    this.handleOptionToggle = this.handleOptionToggle.bind(this);
    this.handleOtherChange = this.handleOtherChange.bind(this);
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

  render() {
    const {
      name,
      optionOther,
      options,
      readOnly,
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
                    disabled={readOnly}
                    onChange={this.onOptionToggle}
                    required={required === true}
                    type="checkbox"
                    value={optionId}
                  />
                  {option}
                </Label>
              </FormGroup>
            ))
          }
          {optionOther && super.renderOptionOther()}
        </fieldset>
        {super.renderError()}
      </div>
    );
  }
}

export default connectInput(InputCheckboxGroup);
