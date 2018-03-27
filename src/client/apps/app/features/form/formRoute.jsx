import React from 'react';
import PropTypes from 'prop-types';
import Form from './components/Form';
// import FormHeader from './components/FormHeader';
import { data as fakeData } from './fakeData';

const propTypes = {};

const defaultProps = {};

function FormRoute() {
  return (
    <Form
      form={fakeData}
    />
  );
}

FormRoute.propTypes = propTypes;
FormRoute.defaultProps = defaultProps;

export default FormRoute;
