import React from 'react';
import PropTypes from 'prop-types';
import Form from 'shared/form/components/Form';
import { data as fakeData } from './fakeData';

const propTypes = {
  form: PropTypes.object.isRequired,
};

const defaultProps = {};

function InterviewContainer(props) {
  return (
    <Form
      {...props}
    />
  );
}

InterviewContainer.propTypes = propTypes;
InterviewContainer.defaultProps = defaultProps;

export default InterviewContainer;
