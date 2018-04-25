import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as formsModule from 'apps/app/shared/redux/forms';
import Form from 'shared/form/components/Form';

const propTypes = {
  // from Redux
  id: PropTypes.string.isRequired,
  form: PropTypes.object,
};

const defaultProps = {
  form: {
    scheme: {
      order: [],
    },
  },
};

function FormPreview(props) {
  const { form } = props;

  return (
    <Form form={form} />
  );
}

FormPreview.propTypes = propTypes;
FormPreview.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { id } = ownProps.match.params;
  const form = formsModule.selectors.getFormEntity(state, id);

  return {
    id,
    form,
  };
}

export default connect(mapStateToProps, null)(FormPreview);
