import React from 'react';
import PropTypes from 'prop-types';
import InputCheckboxGroup from './InputCheckboxGroup';
import InputRadioGroup from './InputRadioGroup';

const propTypes = {
  multiple: PropTypes.bool,
};

const defaultProps = {
  multiple: false,
};

function InputSelect(props) {
  const { multiple } = props;

  return multiple
    ? <InputCheckboxGroup {...props} />
    : <InputRadioGroup {...props} />;
}


InputSelect.propTypes = propTypes;
InputSelect.defaultProps = defaultProps;

export default InputSelect;
