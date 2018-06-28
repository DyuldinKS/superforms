import React from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import connectInput from '../connectInput';
import BaseSelect from './BaseSelect';
import validateWrapper from '../../../utils/validateWrapper';

class InputRadioGroup extends BaseSelect {
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
      values: toggleMap = {},
    } = this.props;

    const { value: optionId } = event.target;
    let nextValue = null;

    if (toggleMap[optionId] === undefined) {
      nextValue = { [optionId]: true };
    }

    const error = validateWrapper(nextValue, required, this.validate);
    setValue(name, nextValue, error);
    this.setState(() => ({ dirty: true }));
  }

  handleOtherChange(value) {
    const {
      name,
      required,
      setValue,
    } = this.props;
    let nextValue = null;

    if (value !== undefined) {
      nextValue = { other: value };
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
      required,
      readOnly,
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
                    type="radio"
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

export default connectInput(InputRadioGroup);
