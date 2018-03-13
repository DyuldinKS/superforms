import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Form from './components/Form';
// import FormHeader from './components/FormHeader';

const propTypes = {};

const defaultProps = {};

function FormContainer(props) {
  return (
    <div className="form-container">
      <Form id="fake" />
    </div>
  );
}

FormContainer.propTypes = propTypes;
FormContainer.defaultProps = defaultProps;

export default FormContainer;
