import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';
import withInputState from '../withInputState';

const propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const defaultProps = {};

function InputNumber(props) {
  const { name, value, onChange } = props;

  return (
    <Input
      type="number"
      min={0}
      name={name}
      value={value}
      onChange={onChange}
    />
  );
}

InputNumber.propTypes = propTypes;
InputNumber.defaultProps = defaultProps;

export default withInputState(InputNumber);
