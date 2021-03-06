import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormText, Label } from 'reactstrap';
import RequiredAsterisk from './RequiredAsterisk';
import { constants as inputTypes } from '../utils/inputTypes';
import getInputByType from '../utils/getInputByType';

const propTypes = {
  description: PropTypes.string,
  id: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(Object.values(inputTypes)).isRequired,
};

const defaultProps = {
  description: null,
  readOnly: false,
  required: false,
};

function FormInput(props) {
  const {
    description,
    id,
    readOnly,
    required,
    title,
    type,
    ...passProps
  } = props;
  const Input = getInputByType(type);

  return (
    <FormGroup>
      <Label>
        {title}
        {
          required &&
            <RequiredAsterisk />
        }
        {
          description &&
            <FormText color="info">{description}</FormText>
        }
      </Label>
      <Input
        {...passProps}
        name={id}
        readOnly={readOnly}
        required={required}
      />
    </FormGroup>
  );
}

FormInput.propTypes = propTypes;
FormInput.defaultProps = defaultProps;

export default FormInput;
