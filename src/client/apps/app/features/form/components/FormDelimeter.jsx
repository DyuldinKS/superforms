import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup } from 'reactstrap';

const propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

const defaultProps = {};

function FormDelimeter(props) {
  const { title } = props;

  return (
    <FormGroup>
      <h6>{title}</h6>
      <hr />
    </FormGroup>
  );
}

FormDelimeter.propTypes = propTypes;
FormDelimeter.defaultProps = defaultProps;

export default FormDelimeter;
