import React from 'react';
import PropTypes from 'prop-types';
import Form from './components/Form';
// import FormHeader from './components/FormHeader';
import { data as fakeData } from './fakeData';

const propTypes = {};

const defaultProps = {};

const { order, items } = fakeData.scheme;

function FormContainer() {
  return (
    <div className="form-container">
      <Form
        order={order}
        items={items}
      />
    </div>
  );
}

FormContainer.propTypes = propTypes;
FormContainer.defaultProps = defaultProps;

export default FormContainer;
