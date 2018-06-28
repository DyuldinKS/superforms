import React from 'react';
import { Input } from 'reactstrap';
import connectInput from './connectInput';
import BaseInput from './BaseInput';

const propTypes = {
  ...BaseInput.propTypes,
};

const defaultProps = {
  ...BaseInput.defaultProps,
};

class InputTime extends BaseInput {
  render() {
    const {
      name,
      readOnly,
      required,
      value,
    } = this.props;

    return (
      <React.Fragment>
        <Input
          className={this.isErrorVisible() ? 'is-invalid' : ''}
          name={name}
          onBlur={this.onBlur}
          onChange={this.onChange}
          readOnly={readOnly}
          required={required === true}
          type="time"
          value={value}
        />
        {super.render()}
      </React.Fragment>
    );
  }
}

InputTime.propTypes = propTypes;
InputTime.defaultProps = defaultProps;

export default connectInput(InputTime);
