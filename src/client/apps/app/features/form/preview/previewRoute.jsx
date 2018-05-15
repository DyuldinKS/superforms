import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as formsModule from 'apps/app/shared/redux/forms';
import createForm from 'shared/form/components/createForm';
import Form from 'shared/form/components/Form';

const propTypes = {
  // from Redux
  id: PropTypes.string.isRequired,
  form: PropTypes.object,
  // from createForm HOC
  getRef: PropTypes.func.isRequired,
};

const defaultProps = {
  form: {
    scheme: {
      order: [],
    },
  },
};

function FormPreview(props) {
  const { getRef, form } = props;

  return (
    <Form
      getRef={getRef}
      form={form}
    />
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

const withForm = createForm(FormPreview);
export default connect(mapStateToProps, null)(withForm);
