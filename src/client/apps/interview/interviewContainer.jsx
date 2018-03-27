import React from 'react';
import PropTypes from 'prop-types';
import Form from 'shared/form/components/Form';
import { data as fakeData } from './fakeData';

const propTypes = {};

const defaultProps = {};

function InterviewContainer(props) {
  return (
    <Form
      form={fakeData}
    />
  );
}

InterviewContainer.propTypes = propTypes;
InterviewContainer.defaultProps = defaultProps;

export default InterviewContainer;
