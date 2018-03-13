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

function InputString(props) {
  const { name, value, onChange } = props;

  return (
    <Input
      name={name}
      value={value}
      onChange={onChange}
    />
  );
}

InputString.propTypes = propTypes;
InputString.defaultProps = defaultProps;

export default withInputState(InputString);
